## 1. Queue write lock (photoUploadService)

- [x] 1.1 Add a promise-chain write lock to `src/screens/PhotosList/upload/photoUploadService.js` and route `addToQueue`, `updateQueueItem`, `removeFromQueue`, and `clearQueue` through it (each operation re-reads the queue after acquiring the lock). Verify: unit test or manual script enqueues a new item concurrently with an `updateQueueItem` call and asserts the persisted queue (expo-storage key `PENDING_UPLOADS`) contains both the updated item and the new item — no cull.
- [x] 1.2 Verify the lock never deadlocks or swallows failures: a throwing mutation (e.g., write with a corrupted payload) leaves the chain usable — a subsequent `addToQueue` still succeeds and the persisted queue contains the new item.

## 2. Stable file copy at enqueue

- [x] 2.1 In `queueFileForUpload`, copy the captured file to `PENDING_UPLOADS_FOLDER/<photoId>.src` (fixed name — do NOT parse the source URI, which has no extension on Android) before persisting the queue entry, and store the stable path as `originalCameraUrl`. If the copy throws, rethrow before `addToQueue` so no entry with a dead path is persisted. Use `File.copy()` (handles both the iOS temp `file://` path and the Android MediaStore `content://` URI); never run `.exists`/path ops on the raw camera URI. The implementation must contain no `Platform.OS` checks. Verify on **both platforms**: capture a photo in dev build and confirm (via log or storage dump) the queue entry's `originalCameraUrl` points into the pendingUploads folder, and that the file exists on disk.
- [x] 2.2 Extend `deleteLocalArtifacts` and `clearQueue` to also delete the stable original file (in addition to `localImgUrl`/`localThumbUrl`/`localVideoUrl`). Verify: after a successful upload and after a user-initiated clear, `ls` of the pendingUploads folder shows no leftover files for the removed items.

## 3. Unrecoverable classification (processQueue loop)

- [x] 3.1 Add unrecoverable pre-checks at the top of the `processQueue` while loop in `src/screens/PhotosList/upload/usePhotoUploader.js`: (a) file check — required file(s) for the item's current stage do not exist on disk (check the stable `PENDING_UPLOADS_FOLDER` paths via the existing `ensureFileExists` helper, never the raw camera URI) → mark `unrecoverable: true, unrecoverableReason: 'missing-file'` via `updateQueueItem` and `continue`; (b) `!isValidLocation(item.location)` → mark `unrecoverableReason: 'invalid-location'` and `continue`. Skips must not increment `consecutiveFailuresRef` and must not call `scheduleRetry`. Verify: seed the queue with an item whose file has been deleted (delete the stable file in the folder) followed by a valid item; run the app with network on; observe the log marks item 1 unrecoverable, item 2 uploads and is removed, and item 1 remains in the persisted queue.
- [x] 3.2 Verify head-of-line blocking is gone: with 3+ items where the first is unrecoverable, the remaining valid items all complete within one processing pass (no 30s pause, no backoff delays attributable to the skipped item).

## 4. Remove all automatic deletion paths

- [x] 4.1 In `processCompleteUpload` (`photoUploadService.js`), replace every `removeFromQueue` call (missing original file, FSFile check failure, invalid location, ACTIVE-skip path stays, and the catch-block `"not found"`/`"missing"` match) with a plain `return null` (the ACTIVE-state removal is the one legitimate removal and stays). Verify: `grep -n "removeFromQueue" src/screens/PhotosList/upload/photoUploadService.js` shows only the ACTIVE-skip usage, and the catch block no longer references error-string matching for deletion.
- [x] 4.2 Rewrite the health-check effect in `usePhotoUploader.js`: on items with `lastFailedAt` older than 5 minutes, log a warning and, if `netAvailable`, call `processQueue()`; remove the `removeFromQueue` loop and the consecutive-failure counter reset. Verify: `grep -n "removeFromQueue" src/screens/PhotosList/upload/usePhotoUploader.js` shows no usages; with a seeded stale-failed item, wait 61s and confirm the item is still in the queue and a processing pass was triggered (log line).

## 5. Foreground re-drive + silent UUID wait

- [x] 5.1 Add an `AppState.addEventListener('change', ...)` effect in `usePhotoUploader.js` that calls `processQueue()` on the `active` state (listener cleaned up on unmount). Verify: put the app in the background with a pending item whose retry timer has lapsed (or kill and relaunch), return to foreground, and observe `processQueue` runs and the item progresses (log).
- [x] 5.2 Remove the "User authentication required. Please restart the app." toast path: `processQueue` with an empty `uuid` returns silently; change the mount effect to depend on `uuid` (`if (netAvailable && uuid) processQueue()`). Verify: cold-start the app with a pending item and confirm no auth toast appears, the item processes once the UUID hydrates, and the queue empties.

## 6. Banner surfaces unrecoverable items

- [x] 6.1 In `src/components/GlobalUploadBanner/index.js`, when any `pendingPhotos` entry has `unrecoverable`, append a compact suffix to the status label (e.g., "1 cannot be uploaded"). Unrecoverable items are already included in `pendingPhotos` counts — do not change the count. Verify: with a seeded unrecoverable item, the banner shows the total count including it and the suffix; long-press → confirm clear removes it and the banner animates out.

## 7. Hygiene + integration verification

- [x] 7.1 Remove the now-unused queue-function imports (`clearQueue`, `removeFromQueue`, `processCompleteUpload`) from `src/screens/PhotosList/reducer.js` if unused there (verify with grep that no reducer action references them). Verify: `npx eslint src/screens/PhotosList/reducer.js src/screens/PhotosList/upload/ src/components/GlobalUploadBanner/` passes with no unused-import errors.
- [ ] 7.2 End-to-end offline/online cycle: capture 2 photos with network off (both copied to pendingUploads, queued), verify no uploads attempted; enable network and observe both upload in order with exactly one completion event each; confirm the persisted queue is empty and no files remain in the pendingUploads folder.
- [ ] 7.3 End-to-end mid-cycle failure recovery: with network flaky (or a dev-only failure injection), force a failure between `createPhoto` and the S3 PUT, relaunch the app, and verify the retry re-queries `generateUploadUrl`, does not re-create the photo record (backend returns the existing one), and the photo eventually uploads once.
- [ ] 7.4 Run the full lint pass for the change (`npx eslint src/`) and confirm the app boots to the main feed with an empty queue (no errors, no toasts).
