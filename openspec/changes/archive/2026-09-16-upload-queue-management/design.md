## Context

The pending upload queue is owned by a single `usePhotoUploader` instance in `UploadProvider` (`src/contexts/UploadContext.js`). The processing loop (`processQueue`) walks the queue head-first under a `processingRef` re-entrancy guard, with exponential backoff, a 30s pause after 5 consecutive failures, a 60s health-check interval, and re-drive from three automatic paths: the network/uuid mount effect, the health-check interval, and the `AppState` "active" listener. Queue persistence (expo-storage) already supports per-item removal via `removeFromQueue(photoId)` and file cleanup via `deleteLocalArtifacts(item)` in `photoUploadService.js`. The `UngroupedPhotosCard` component (`src/components/UngroupedPhotosCard/index.js`) establishes the in-app selection model this change mirrors: a `Set` of selected ids, action buttons gated on `selectedIds.size === 0` / `> 0`, dimmed (`opacity: 0.5`) rather than hidden disabled buttons, and a `showConfirmAlert` for the destructive whole-pool action. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- User-initiated pause that is perceptually immediate: no new item starts, banner flips to "paused" on press
- A queue management modal with per-item selection, "Delete (N)", and "Delete All", matching the `UngroupedPhotosCard` interaction model
- The in-flight item stays visible in the modal but is not selectable
- Closing the modal always resumes

**Non-Goals:**
- Aborting an in-flight `fetch` (no `AbortController` plumbing; partial S3 objects avoided by design)
- Persisting pause state across app restarts
- Reordering the queue, editing queue item metadata, or per-item retry controls
- Any backend changes

## Decisions

### 1. Pause = stop-before-next-item (Option A), not hard abort

**Decision**: `pauseUploads()` sets a `pausedRef` + `isPaused` state, calls `cleanupRetry()` to cancel any pending retry timer, and does nothing to the in-flight transfer. The processing loop checks `pausedRef.current` at the top of each iteration and `break`s, and the post-loop retry scheduling is skipped while paused. `isUploading` is left to the loop's own `finally` (it reflects "a pass is running", which is true until the in-flight item settles).

**Rationale**: RN `fetch` with a FileSystem body has unreliable abort semantics, and an aborted S3 PUT can leave an orphan object that the three-state photo detection (ACTIVE/INACTIVE/MISSING) would have to reconcile. Stopping before the next item is safe: the in-flight item either succeeds (removed from queue on the confirmed-success path) or fails (stays in queue, becomes selectable). The banner switches to "paused" instantly, which is what the user perceives.

**Alternative considered**: `AbortController` on the in-flight `fetch` (Option B). Rejected — orphan S3 objects, murky RN abort semantics with `FSFile` bodies, and no user-visible benefit given the banner flips immediately either way.

### 2. Pause gates every automatic re-drive path

**Decision**: All three existing re-drive paths check `pausedRef.current` before calling `processQueue`:
- the mount effect on `[netAvailable, uuid, processQueue]` (network recovery / uuid hydration)
- the 60s health-check interval
- the `AppState` "active" listener
The post-loop retry scheduling inside `processQueue` is also skipped while paused, and `scheduleRetry` itself is a no-op while paused.

**Rationale**: Any path that re-drives without the check would silently defeat the pause (e.g., the health check firing 60s later, or the app returning to foreground). The ref (not state) is authoritative for the loop because the loop closure must not re-create on every state change; `isPaused` state exists only to drive the UI.

**Alternative considered**: A Jotai atom for pause state. Rejected — pause is owned by the hook and only the banner + modal read it via `UploadContext`; an atom would add a second source of truth.

### 3. `activeUploadId` set/clear around `processCompleteUpload`

**Decision**: The loop sets `setActiveUploadId(currentItem.photoId)` immediately before `await processCompleteUpload(...)` and clears it to `null` in a `finally` around that call. `activeUploadId` is React state (not a ref) because the modal renders from it and needs to re-render when the in-flight item changes or finishes.

**Rationale**: The modal needs to know which row is in flight to dim it and block selection. State gives the re-render for free. The `finally` guarantees clearing on both success and failure, and on the pause-break path (the break happens after `processCompleteUpload` returns, so the finally has already run — the next iteration never sets a new value).

**Alternative considered**: A ref read imperatively by the modal. Rejected — no re-render, modal would show stale in-flight state.

### 4. `removePendingItem` composes existing service functions

**Decision**: `removePendingItem(item)` in the hook = `removeFromQueue(item)` + `deleteLocalArtifacts(item)` + `syncQueueFromStorage()`. No new service-layer code.

**Rationale**: Both primitives already exist and are individually tested (`photoUploadService.test.js`). The hook is the right composition point because it owns the `pendingPhotos` state re-sync.

### 5. New `UploadQueueModal` component, not an `ActionMenu` extension

**Decision**: A dedicated `src/components/UploadQueueModal/index.js`, styled after the `WaveSelectorModal`/`MergeWaveModal` bottom-sheet-style modals (not the centered `ActionMenu` card). It is always in selection mode — there is no "Select photos" / "Cancel" toggle, because opening the modal *is* the manage intent (the queue is always ≤ a handful of items).

**Rationale**: `ActionMenu` renders a static list of icon+label rows; it cannot express a scrollable thumbnail list, per-row selection state, per-row spinners, or a count-gated footer. The `UngroupedPhotosCard` gating rules transfer directly:
- `canDeleteSelected = selectedIds.size > 0` → "Delete (N)" enabled
- `canDeleteAll = selectedIds.size === 0` → "Delete All" enabled (dimmed at ≥1)
- both buttons always rendered; inapplicable one at `opacity: 0.5`

**Alternative considered**: Extending `ActionMenu` with a thumbnail-row item type. Rejected — would bloat a general-purpose component with queue-specific selection and footer logic.

### 6. Modal state: local `selectedIds` Set, pruned against live queue

**Decision**: The modal owns `selectedIds` as local state (a `Set` of `photoId`s), reset on open and on close. A `useEffect` prunes `selectedIds` whenever `pendingPhotos` changes (an in-flight success removes its id automatically). Delete actions: "Delete (N)" loops `removePendingItem` over the selection (the queue is small; sequential is fine and matches the `UngroupedPhotosCard` loop pattern), then resets the selection and keeps the modal open. "Delete All" shows `showConfirmAlert` (reusing the banner's breakdown string) then calls `clearPendingQueue()`.

**Rationale**: Local state keeps the modal self-contained; `UploadContext` only supplies data + actions. Pruning on queue change means the selection count can never reference a gone item.

### 7. Close = resume, gated on in-flight delete

**Decision**: `handleClose` (close button and overlay) resets selection and calls `resumeUploads()`. While a delete is executing (a local `deleting` flag), close/overlay taps are ignored, mirroring `UngroupedPhotosCard`'s `if (!manualGrouping)` guard.

**Rationale**: Resuming on close is the single exit path — there is no "stay paused" close. The guard prevents a close-tap mid-delete from resuming the queue while items are still being removed (removals are queue mutations, not uploads, so the interaction is harmless either way, but the guard matches the established pattern and avoids a modal that flickers back).

### 8. Banner: 3-dots + long-press both route through one handler

**Decision**: One `handleManageQueue` in `GlobalUploadBanner`: `pauseUploads()` then set local `queueModalVisible` to `true`. Both the 3-dots `onPress` and the card `onLongPress` call it. The `UploadQueueModal` renders from the banner (which is inside `UploadProvider`). The old `handleClearQueue`/`showConfirmAlert` path in the banner is deleted. The banner's existing `clearBreakdown` string moves into the modal's "Delete all" confirm.

**Rationale**: Single code path for both entry points (the user requirement: 3-dots "acts the same as the long press"). Rendering the modal from the banner keeps the toast top-offset logic (banner height) co-located.

## Risks / Trade-offs

- [In-flight item succeeds after pause, user deletes "all" in the modal] → The in-flight item's confirmed-success `removeFromQueue` runs against an already-empty queue — a no-op with a dev-mode warning at most. No data loss: the photo is already confirmed on the server.
- [Pause lost across app kill] → Intentional (non-goal). On restart the queue recovers unpaused via the existing mount effect; the user re-pauses if needed.
- [`activeUploadId` state churn re-renders the banner every item] → The banner only renders when `pendingPhotos` is non-empty (rarely more than a handful of items); re-render cost is negligible.
- [Long-press is now destructive-adjacent (opens a modal that can clear the queue)] → The modal requires explicit selection or an explicit confirm for "Delete all"; a stray long-press only pauses + opens a modal, which is reversible (close = resume).
- [Modal open while app is backgrounded] → The RN `Modal` stays mounted; on foreground the `AppState` re-drive is gated by the pause, and the in-flight item (if any) has already settled. Selection state is local and unaffected.
- [`removePendingItem` on an item whose file is already deleted] → `deleteItemLocalFiles` is best-effort and logs; no throw.

## Migration Plan

No data migration. The persisted queue shape is unchanged. Deploy with the app; rollback = revert the change (the old long-press confirm path is removed in the same commit, so rollback restores it atomically).

## Open Questions

None — all blocking decisions (entry points, pause semantics, modal interaction model, in-flight row behavior) were resolved during exploration.
