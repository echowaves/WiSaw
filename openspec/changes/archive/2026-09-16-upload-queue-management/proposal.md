## Why

The global upload banner's only management affordance is a long-press that opens a destructive "Clear Upload Queue" confirm with no way to see or select individual items. Users cannot pause an upload in progress, and the only way to remove a single stuck or unwanted item from the queue is to clear the entire queue.

## What Changes

- Add a vertical 3-dots icon button to the right edge of the `GlobalUploadBanner` card
- Long-press on the banner card is repurposed: it no longer opens the "Clear Upload Queue" confirm alert; it pauses the queue and opens the queue management modal (same as tapping the 3-dots)
- **BREAKING** (behavior): the long-press confirm-alert clear path is removed; clearing the whole queue now happens inside the queue management modal via "Delete all from queue"
- New pause semantics: pausing stops the processing loop before the *next* item, cancels pending retry timers, and gates all automatic re-drive paths (network-recovery effect, 60s health check, `AppState` active). An in-flight transfer is never aborted — it completes or fails normally, then the queue item leaves the queue on success or becomes selectable on failure
- New `UploadQueueModal` component (`src/components/UploadQueueModal/index.js`) showing every pending item with thumbnail, per-item selection (mirroring the `UngroupedPhotosCard` selection model), and two actions:
  - "Delete (N)" — enabled when ≥1 item is selected; removes the selected items from the queue and deletes their local artifacts
  - "Delete All" — enabled only when nothing is selected (dimmed + disabled while ≥1 selected), with a confirm alert
  - The in-flight item (identified by `activeUploadId`) is always shown but never selectable, with a spinner
- Closing the modal resumes the queue
- `usePhotoUploader` gains `isPaused`, `activeUploadId`, `pauseUploads()`, `resumeUploads()`, and `removePendingItem(item)`; all exposed through `UploadContext`

## Capabilities

### New Capabilities

- `upload-queue-management`: user-initiated pause/resume of the upload queue, exposure of the in-flight upload identity, per-item queue removal, and the `UploadQueueModal` selection + deletion behavior

### Modified Capabilities

- `global-upload-banner`: banner now renders a 3-dots button; long-press pauses + opens the queue modal instead of showing the clear confirm; new "paused" status label/icon state and dimmed progress strip; toast-offset requirement re-scoped to modal actions
- `upload-orchestration`: `UploadContext` additionally exposes `isPaused`, `activeUploadId`, `pauseUploads`, `resumeUploads`, and `removePendingItem`

## Impact

- **Code**:
  - `src/screens/PhotosList/upload/usePhotoUploader.js` — pause refs/state, `activeUploadId`, loop + re-drive gating, three new functions
  - `src/contexts/UploadContext.js` — expose new context values
  - `src/components/GlobalUploadBanner/index.js` — 3-dots button, long-press rewire, paused label/icon, dimmed progress strip, modal mount
  - `src/components/UploadQueueModal/index.js` — new component
- **Service layer**: no changes — `photoUploadService` already exports `removeFromQueue` and `deleteLocalArtifacts`
- **Dependencies**: none new — `expo-cached-image` already in use for thumbnails; no icon pack additions beyond those already bundled
- **Backend**: none
