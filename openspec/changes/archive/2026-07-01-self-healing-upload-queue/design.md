## Context

The upload queue lives in `src/screens/PhotosList/upload/` and is orchestrated by the `usePhotoUploader` hook. Items are persisted to `expo-storage` under `PENDING_UPLOADS_KEY`. Each queue item carries a `type` field (`'image'` or `'video'`), an `originalCameraUrl`, a `localImageName`, and optional metadata like `waveUuid` and `location`.

The queue processor runs in a `while` loop that pulls items from the front of the queue, processes them via `processCompleteUpload`, and removes successful uploads. A `processingRef` prevents concurrent processing. When `netAvailable` is false, retries are scheduled via a 750ms timeout.

Four bugs cause the queue to get permanently stuck:

1. **`processingRef` deadlock**: If `resolveUuid()` throws before the `try` block, `processingRef.current` stays `true` forever.
2. **Failed items block the queue**: `processCompleteUpload` returns `null` on failure, causing the loop to `break` — the failed item stays at the front and the same failure repeats.
3. **Error in `enqueueCapture` leaks**: Errors after `processingRef.current = true` are caught in `enqueueCapture`'s `.catch()` but the processing lock is never released.
4. **Network interruption mid-upload**: The 750ms retry fires once but doesn't re-trigger if `netAvailable` flips to `false` again.

## Goals / Non-Goals

**Goals:**
- The upload indicator shows accurate photo vs video counts with appropriate icons.
- A single failed upload does not block the rest of the queue.
- The processing lock is always released, even on unexpected errors.
- Genuinely stuck items (in the queue >5 minutes with no progress) are cleared by a background health check.
- Network recovery reliably re-triggers upload processing.

**Non-Goals:**
- Changing the upload protocol or backend API.
- Adding retry budgets or exponential backoff (out of scope).
- Modifying the `photoUploadService.js` file upload logic.
- Changing how location validation works.

## Decisions

### Decision 1: Wrap entire `processQueue` in try/catch, release lock in finally

**Why**: The current code sets `processingRef.current = true` outside the `try` block, meaning any exception before the `try` (e.g., `resolveUuid()` throwing) leaves the lock permanently set.

**Approach**: Move the `resolveUuid()` call inside the `try` block so ALL code paths — including exceptions — go through `finally` which releases the lock.

**Alternatives considered**:
- Moving lock acquisition to after `resolveUuid()`: Would require restructuring the early-return pattern. Less clean.
- Using a separate "unlock" function: Error-prone, duplicates the finally pattern.

### Decision 2: Retry failed items with exponential backoff instead of skipping

**Why**: Users expect their captured photos and videos to eventually upload — skipping them feels like data loss. The current code's `break` on failure is the real bug, not the retry behavior itself. A failed item should stay in the queue and be retried.

**Approach**: When `processCompleteUpload` returns `null`, keep the item at the front of the queue but introduce a per-item `retryCount` and `lastFailedAt` field. Apply exponential backoff: retry after 1s, 2s, 4s, 8s, capping at 16s. After 5 consecutive failures, pause the queue entirely and schedule a recovery retry after 30 seconds (e.g., for network reconnection). Log each retry attempt with the item's filename for debugging.

**Alternatives considered**:
- Skipping failed items immediately: Feels like data loss to the user. Rejected.
- Moving the failed item to a separate "failed" queue: New data structure, new UI — too much scope.

### Decision 3: Increase retry delay from 750ms to 2000ms

**Why**: 750ms is too aggressive for network state recovery. On cellular networks, reconnection can take several seconds. A longer delay reduces wasted retry attempts and toast spam.

**Alternatives considered**:
- Exponential backoff (750ms → 1500ms → 3000ms): Adds complexity; 2000ms flat is sufficient for most cases.
- Waiting for `netInfo` state change events: Would require refactoring the retry mechanism to listen to events instead of using timeouts.

### Decision 4: Add periodic health-check effect

**Why**: Items that have been in the queue for >5 minutes with no progress are genuinely stuck (e.g., file was deleted, network is permanently unavailable). The health check clears them to prevent the queue from being permanently clogged.

**Approach**: A `useEffect` runs every 60 seconds, scans the queue for items older than 5 minutes, and removes them. Items are only considered stuck if they have no `processedAt` marker and exceed the age threshold.

**Alternatives considered**:
- Clearing all items on app foreground: Too aggressive — would lose legitimate pending uploads.
- User-initiated clear only: Already exists via long-press; but users don't always notice stuck queues.

### Decision 5: Banner counts photos and videos separately

**Why**: The `type` field (`'image'` or `'video'`) already exists on every queue item. The banner just needs to count and format. No new data or API changes required.

**Approach**: Filter `pendingPhotos` by type, format counts with proper singular/plural, join with ", ". Icon selection: `photo` for image-only, `videocam` for video-only, `cloud-upload` for mixed.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Retry loop causes repeated failed uploads (e.g., bad file, bad location) | Exponential backoff (1s→2s→4s→8s→16s) reduces server load. After 5 failures, queue pauses for 30s. Health check clears items stuck >5 min. |
| Health check might clear items that are still processing slowly | Only items older than 5 minutes are considered stuck. Normal uploads complete in seconds. Items with `processedAt` are excluded. |
| Longer retry delay (2s vs 750ms) makes the queue feel slower on first retry | The 2s delay only applies to the retry-after-failure path. Successful uploads are immediate. |
| Dynamic icons might confuse users who expect a consistent upload icon | The icon change is subtle and only affects edge cases (all-video or all-photo queues). Mixed queues keep the standard cloud-upload icon. |
