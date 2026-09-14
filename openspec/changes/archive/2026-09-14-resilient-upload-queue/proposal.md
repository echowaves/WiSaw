## Why

Photos can be permanently lost by the upload pipeline: the health check deletes queue items whose last failure is older than 5 minutes (which matches items merely waiting for a retry after app suspension/kill), missing-file and error-string matches delete items on transient failures, camera temp files can be evicted by the OS before processing, and a read-modify-write race between the processing loop and new captures can silently cull a queue entry. The product rule is: **a queued photo must eventually upload; the only way it leaves the queue is the user long-pressing the upload banner.**

## What Changes

- **No more automatic deletion.** Remove every automatic `removeFromQueue` path except the one after confirmed success. The health check becomes log-only (and re-drives processing instead of deleting). Missing local files no longer delete — they mark the item unrecoverable and the processing loop skips past it (no head-of-line blocking), leaving it in the queue and the banner for the user to clear.
- **Stable file storage at enqueue.** `queueFileForUpload` copies the captured file into `PENDING_UPLOADS_FOLDER` immediately, so uploads never depend on OS temp-file lifetime. The queue entry references the stable path.
- **Foreground re-drive.** An `AppState` → `active` listener calls `processQueue()`, so the queue resumes after the app is suspended or killed. (No background-mode upload support — out of scope.)
- **Queue write serialization.** All queue read-modify-write operations (add, update, remove, clear) are serialized through a single-writer lock, eliminating the lost-update race that can cull entries.
- **Cold-start auth gate.** `processQueue` waits silently for the device UUID instead of showing "Please restart the app" when the UUID atom hasn't hydrated yet.
- **Resumable upload cycle (preserved, now reliable).** The existing 3-step cycle (local file ready → backend record → S3 upload) stays, and each step remains safe to re-run: `createPhoto` is idempotent on the backend (verified: UNIQUE-violation 23505 returns the existing record), `generateUploadUrl` is re-queried on every attempt, and the upload URL is never cached across retries.
- **No legacy migration.** Pre-existing queue entries pointing at evicted temp files are simply skipped as unrecoverable — no backwards-compatibility work.

## Capabilities

### New Capabilities

- `upload-queue-recovery`: guarantees queued photos are never automatically dropped; defines retry-until-success semantics, the unrecoverable-item skip rule, foreground re-drive, health-check behavior, and the user-only queue-clearing contract.

### Modified Capabilities

- `photo-upload`: "Geo Coordinate Validation at Upload Time" scenarios that remove the item from the queue are replaced by the unrecoverable-skip rule; new requirement that captured files are persisted to the stable pending-uploads folder at enqueue time.
- `upload-orchestration`: new requirement that all queue read-modify-write operations are serialized through a single-writer lock (eliminates the lost-update race); new requirement that queue processing waits silently for the device UUID at cold start instead of showing a restart error.

## Impact

- `src/screens/PhotosList/upload/usePhotoUploader.js` — health check, AppState listener, uuid gate, processQueue skip logic
- `src/screens/PhotosList/upload/photoUploadService.js` — `queueFileForUpload` file copy, `processCompleteUpload` deletion paths removed, queue write lock, `readQueue`/`writeQueue` serialization
- `src/components/GlobalUploadBanner/index.js` — surface unrecoverable (skipped) items in the banner count/label
- `src/screens/PhotosList/reducer.js` — drop now-unused queue-function imports
- No backend changes (idempotency of `createPhoto` already verified in `Wisaw.cdk`)
- No new dependencies; no background-mode configuration
