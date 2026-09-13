# Design: Resilient Upload Queue

## Context

The upload pipeline lives in `src/screens/PhotosList/upload/` (`usePhotoUploader.js` — orchestration; `photoUploadService.js` — queue persistence + per-item processing) and is mounted app-wide via `UploadProvider` in `app/(drawer)/_layout.tsx`. The queue is persisted in expo-storage under `PENDING_UPLOADS_KEY`; processed media lives in `PENDING_UPLOADS_FOLDER` (document dir). The processing loop is already re-entrancy guarded (`processingRef`) and processes items strictly one at a time. `createPhoto` on the backend is idempotent (UNIQUE-violation 23505 returns the existing record), and `uploadFile` already re-queries `generateUploadUrl` on every attempt — so the per-item cycle is already resumable; what is broken is the deletion paths, the temp-file dependency, the restart/foreground re-drive, and a queue write race (see proposal.md).

## Goals / Non-Goals

**Goals:**
- Zero automatic deletion of queue items (success + user clear only).
- No dependence on OS temp-file lifetime.
- Queue resumes after app kill/suspend without user action.
- No lost-update races on the persisted queue.
- Strictly one upload cycle at a time (already true; preserved).

**Non-Goals:**
- Background-mode uploads (explicitly out of scope per product decision).
- Legacy queue migration: pre-existing entries with evicted temp files are simply classified as unrecoverable on the first pass and skipped.
- Changes to the backend, the 3-state photo detection, the event bus, or backoff timing.

## Decisions

### D1: Single-writer promise-chain lock for all queue mutations

`photoUploadService` gains an internal async mutex: a promise chain (`let tail = Promise.resolve()`) that every queue mutation (`addToQueue`, `updateQueueItem`, `removeFromQueue`, `clearQueue`) funnels through. Each operation re-reads the queue after acquiring the lock, mutates, and writes.

```
writeLock(op) = tail.then(op)   // op does read → mutate → write
                 .catch(...)    // chain continues even if op fails
```

- **Why**: `expo-storage` offers no compare-and-swap or transactions; the queue is read-modify-write across `await`s. A process-local mutex is the simplest correct fix for the cull race (processing pass updates an item while a new capture enqueues).
- **Why not a version/CAS field**: storage has no atomic conditional write; a version check would still race between read and write.
- **Why not a React reducer for the queue**: the queue is mutated from non-React code paths (services, health check) and must persist across provider remounts; the mutex lives with the data, not the component.
- The `processingRef` loop lock is kept as-is — it serializes *processing passes*; the write lock serializes *storage writes*. They are orthogonal and nest safely (no lock is held while another is acquired; each mutation is a short read-write).

### D2: Unrecoverable classification is a persisted flag, checked by the loop

Queue entries gain two optional fields: `unrecoverable: true` and `unrecoverableReason: 'missing-file' | 'invalid-location'`. No migration — entries without the field behave exactly as today.

The `processQueue` loop, **before** calling `processCompleteUpload` for `queue[0]`, classifies the item:

1. **File check** — the file the pipeline needs *next*:
   - unprocessed item (no `localImgUrl`): `originalCameraUrl` (now the stable path)
   - processed image: `localImgUrl`; processed video: `localImgUrl` **and** `localVideoUrl`
   If the needed file does not exist on disk → mark `unrecoverable: 'missing-file'` (via locked `updateQueueItem`), `continue` to the next item. No retry scheduled, no failure counter incremented, no pause triggered.
2. **Location check** — `!isValidLocation(item.location)` → mark `unrecoverable: 'invalid-location'`, `continue`. (Location is a capture-time snapshot; it can never become valid.)

`processCompleteUpload` keeps its existing defensive file/location checks but they become pure `return null` fallbacks (no `removeFromQueue`) — they only fire on races (e.g., user cleared the queue mid-pass) or if the loop pre-check and the operation disagree.

- **Why a flag instead of recomputing every pass**: the disk check is cheap, but the flag makes the skip durable, observable (the banner reads it), and avoids re-toasting "missing file" on every pass.
- **Why skip instead of retry**: there is no input left to process; retrying an item whose file is gone is infinite busy-fail, and retrying an invalid location is pointless. Skipping (not deleting) preserves the user-visible record and the user-only-clearing rule.
- **Head-of-line blocking is impossible**: the loop `continue`s past flagged items, so recoverable items behind them upload normally.

### D3: Enqueue copies the capture into `PENDING_UPLOADS_FOLDER`

`queueFileForUpload` generates the `photoId` first, then copies the camera temp file to `PENDING_UPLOADS_FOLDER/<photoId>.src` — a fixed, deterministic name — and persists the queue entry with `originalCameraUrl` pointing at the **stable path**. The copy is `FSFile.copy()` — not move — because the camera/media-library flows may still reference the temp URI. The name is deliberately NOT derived from the source URI: the Android `content://` URI carries no extension, and nothing in the pipeline keys off the source filename (`ImageManipulator`/`VideoThumbnails` detect format from content; today's Android path already stores extensionless `localImageName`s). The `<photoId>.src` name cannot collide with `localImageName` (UUID vs camera basename / MediaStore ID).

- **Why copy at enqueue**: the OS can evict temp files at any time (aggressively on Android OEM devices); the pipeline's first step (compression) reads the source file, so the source must be durable before it can be needed.
- **Cross-platform source**: the source URI is a real temp path on iOS but a MediaStore `content://` URI on Android. `File.copy()` handles both; path-style checks (`.exists`) must never be run on the raw camera URI — only on the stable destination. Existence checks reuse the existing `ensureFileExists` helper (try/catch, returns false on any error) — safe on both platforms.
- **No platform branching**: the fixed `<photoId>.src` name, `File.copy()` source handling, `Paths.document`, and `AppState` are all identical on iOS and Android — the implementation contains zero `Platform.OS` checks.
- **Failure semantics**: if the copy throws (disk full etc.), `queueFileForUpload` rethrows *before* `addToQueue` runs, so no entry with a dead path is ever persisted. `enqueueCapture`'s existing catch surfaces the error; `useCameraCapture` shows its existing error toast. The user can re-capture.
- **Lifecycle**: `deleteLocalArtifacts` (post-success) and `clearQueue` (user clear) already delete the local URLs; they additionally delete the stable original path. The media-library copy is a separate user-owned file and is never touched.
- `processQueuedFile` still moves its compressed output into `PENDING_UPLOADS_FOLDER/<localImageName>` as today.

### D4: AppState `active` re-drive + silent UUID wait

- `usePhotoUploader` adds `AppState.addEventListener('change', ...)`; on `active` it calls `processQueue()` unconditionally (the loop's per-item `NetInfo.fetch()` handles offline). The existing `processingRef` guard makes repeated `active` transitions (notifications, etc.) no-ops.
- The cold-start toast path is removed: `processQueue` with an empty `uuid` now returns silently. The mount effect becomes `useEffect(() => { if (netAvailable && uuid) processQueue() }, [netAvailable, uuid, processQueue])` — when the root layout hydrates the UUID, the effect re-fires and processing proceeds. If identity genuinely never exists, the queue sits (visible in the banner) and the app's identity flow applies; no scary "restart the app" toast.

### D5: Health check re-drives instead of deleting

The 60s interval stays. For items with `lastFailedAt` older than 5 minutes it now: logs a warning and, if `netAvailable`, calls `processQueue()` (recovery from a lost in-memory retry timer, e.g., after a kill). It no longer removes items and no longer resets the consecutive-failure counter.

### D6: Banner surfaces unrecoverable items

`GlobalUploadBanner` already counts `pendingPhotos`; unrecoverable items are included in that count (they remain queue entries). The status label appends a compact suffix when `pendingPhotos.some(p => p.unrecoverable)` — e.g., "2 photos · 1 cannot be uploaded". Long-press clear is unchanged and clears them (spec: user is the only deleter).

## Platform Consistency (iOS / Android)

Verified against the installed SDKs (`expo-file-system ~57.0.4`, `expo-image-picker ~57.0.11`) and the project's permission configs.

| Design piece | iOS | Android | Notes |
|---|---|---|---|
| `File.copy()` (D3) | ✓ | ✓ | `NativeFileSystemFile.copy()` exists in both; `overwrite` defaults `false` |
| `Paths.document` stable folder | ✓ | ✓ | App sandbox on both platforms |
| `new FSFile(uri).exists` (D2) | ✓ | ✓ | Only ever called on the *stable* `file://` path, never on the raw camera URI |
| `AppState` `active` re-drive (D4) | ✓ | ✓ | Fires on both; re-entrancy guard absorbs duplicate transitions |
| expo-storage queue + write lock (D1) | ✓ | ✓ | Pure JS / same native API both platforms |
| `createPhoto` idempotency (resume) | ✓ | ✓ | Backend, platform-agnostic |

**Key platform difference — the camera temp URI scheme:**

```
  expo-image-picker asset.uri:
    iOS     →  file:///var/mobile/.../tmp/IMG_....jpg   (real path, OS-evictable)
    Android →  content://media/external/images/media/N   (MediaStore content URI)
```

- `File.copy()` accepts `content://` sources, so D3 works unchanged on Android.
- `FSFile.exists` / path-style operations are **not** reliable on `content://` URIs. Because D3 rewrites `originalCameraUrl` to the stable document-dir path *before the queue entry is persisted*, the D2 existence check and `processQueuedFile` always operate on real `file://` paths by the time they run. The copy must stay in the foreground capture flow (it is — back-to-back with `Asset.create` in `takePhoto`), because Android OEM battery managers can clear app temp/cache faster than iOS; doing the copy in the same JS turn as capture closes that window.

**Permissions** (the capture flow both platforms depend on) are already configured: iOS `NSCameraUsageDescription` + `NSPhotoLibraryAddUsageDescription` (`ios/WiSaw/Info.plist`); Android `CAMERA`, `READ_MEDIA_IMAGES/VIDEO/AUDIO/VISUAL_USER_SELECTED`, `WRITE_EXTERNAL_STORAGE (maxSdk 32)` (`AndroidManifest.xml`). No new permission is introduced by this change (no background mode).

## Risks / Trade-offs

- **[Disk growth from invalid-location items]** Their files exist but can never upload, so bytes sit until the user clears. → Mitigation: they are visible in the banner (count + suffix); each item is a few MB; no automatic cleanup is acceptable per the user-only-deletion rule.
- **[Temporary double storage at enqueue]** Temp + stable copy coexist until success/clear. → Mitigation: temp files are OS-GC'd; stable copies are deleted on success or clear; peak extra usage is bounded by the in-flight queue.
- **[Write lock is in-process only]** A process-local mutex does not protect against two app processes. → Not a concern: a single JS runtime owns the queue; expo-storage writes are whole-value.
- **[AppState `active` fires often]** → `processQueue` on an empty queue is a cheap read; the re-entrancy guard absorbs overlapping transitions.
- **[Rollback]** Reverting the code restores old behavior; the new queue fields are optional and ignored by old code. (Old code's health check would again delete stale items — that is the pre-change behavior, acceptable as a rollback.)

## Migration Plan

No data migration. On first launch after the update, the first processing pass classifies any legacy entry whose temp file is already gone as `unrecoverable: 'missing-file'` and skips it — the intended behavior, with zero special-casing. Deploy as a normal app update; rollback is a code revert.
