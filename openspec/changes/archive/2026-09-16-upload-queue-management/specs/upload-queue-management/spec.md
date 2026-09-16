> This specification defines user-initiated management of the pending upload queue: pausing and resuming the upload pipeline, exposing the in-flight upload item, removing individual queue items, and the `UploadQueueModal` that provides selection and deletion.

## ADDED Requirements

### Requirement: Upload queue pause and resume lifecycle

The system SHALL provide `pauseUploads()` and `resumeUploads()` functions on `usePhotoUploader`, exposed through `UploadContext`, backed by a paused ref and an `isPaused` state. Pausing SHALL stop the processing loop before the next item, cancel any pending retry timer, and gate every automatic re-drive path. An in-flight upload transfer SHALL NOT be aborted.

#### Scenario: Pausing while the queue is idle
- **WHEN** the user calls `pauseUploads()` and the processing loop is not running
- **THEN** `isPaused` SHALL be `true`
- **THEN** the banner status label SHALL read "paused"
- **THEN** no automatic re-drive (network-recovery effect, health check, `AppState` active) SHALL start `processQueue`

#### Scenario: Pausing while an item is in flight
- **WHEN** the user calls `pauseUploads()` while `processCompleteUpload` is awaiting for the current item
- **THEN** the in-flight transfer SHALL run to completion or failure
- **THEN** the processing loop SHALL break before starting the next queue item
- **THEN** the banner status label SHALL read "paused" immediately

#### Scenario: In-flight item succeeds after pause
- **WHEN** the in-flight item completes successfully after the queue was paused
- **THEN** the item SHALL be removed from the queue normally (confirmed success path)
- **THEN** no further item SHALL be processed
- **THEN** `activeUploadId` SHALL be cleared

#### Scenario: In-flight item fails after pause
- **WHEN** the in-flight item fails after the queue was paused
- **THEN** the item SHALL remain in the queue in its failed state (retryCount/lastFailedAt updated)
- **THEN** no retry timer SHALL be scheduled
- **THEN** the item SHALL become selectable in the queue modal

#### Scenario: Resuming with items remaining
- **WHEN** the user calls `resumeUploads()` and the queue is non-empty
- **THEN** `isPaused` SHALL be `false`
- **THEN** `processQueue` SHALL be re-driven if the network is available

#### Scenario: Resuming with an empty queue
- **WHEN** the user calls `resumeUploads()` and the queue is empty
- **THEN** `isPaused` SHALL be `false`
- **THEN** no processing SHALL start

#### Scenario: Pause state is not persisted
- **WHEN** the app is restarted while the queue was paused
- **THEN** the queue SHALL start in the unpaused state (normal recovery behavior applies)

### Requirement: In-flight upload identity is exposed

The system SHALL expose `activeUploadId` (the `photoId` of the item currently being processed by the processing loop, or `null`) through `usePhotoUploader` and `UploadContext`. The value SHALL be set before `processCompleteUpload` is awaited and cleared in a `finally` block.

#### Scenario: Active item identified during processing
- **WHEN** the processing loop begins processing a queue item
- **THEN** `activeUploadId` SHALL equal that item's `photoId`

#### Scenario: Active item cleared after processing
- **WHEN** `processCompleteUpload` resolves or throws for the current item
- **THEN** `activeUploadId` SHALL be `null`

#### Scenario: No active item when loop is idle
- **WHEN** the processing loop is not running
- **THEN** `activeUploadId` SHALL be `null`

### Requirement: Per-item queue removal

The system SHALL provide `removePendingItem(item)` on `usePhotoUploader`, exposed through `UploadContext`, which removes a single item from the persisted queue and deletes its local artifacts.

#### Scenario: Removing a queued item
- **WHEN** `removePendingItem(item)` is called for an item with a `photoId`
- **THEN** the item SHALL be removed from the persisted queue via `removeFromQueue`
- **THEN** the item's local artifacts (compressed image, thumbnail, video, stable original) SHALL be deleted via `deleteLocalArtifacts`
- **THEN** the hook's `pendingPhotos` state SHALL be re-synced from storage

#### Scenario: Removing a non-active item while paused
- **WHEN** `removePendingItem(item)` is called for a non-active item while the queue is paused
- **THEN** the item SHALL be removed from the queue
- **THEN** the queue SHALL remain paused

### Requirement: Upload queue modal renders the pending items

The system SHALL provide a `UploadQueueModal` component at `src/components/UploadQueueModal/index.js` that renders the pending upload queue in a themed modal. Every pending item SHALL be rendered as a row with a thumbnail, a selection indicator, and a status indicator. The modal SHALL be always in selection mode (no "Select photos" / "Cancel" toggle).

#### Scenario: Modal lists all pending items
- **WHEN** the modal is opened with a non-empty `pendingPhotos` array
- **THEN** each pending item SHALL be rendered as a row with its thumbnail (`localThumbUrl`, falling back to `localImgUrl`, falling back to `originalCameraUrl`), displayed via `expo-cached-image`

#### Scenario: In-flight item is visible but not selectable
- **WHEN** a row's `photoId` equals `activeUploadId`
- **THEN** the row SHALL be rendered dimmed and SHALL NOT respond to selection taps
- **THEN** the row SHALL display an `ActivityIndicator` in place of the selection indicator

#### Scenario: Selecting a row toggles selection
- **WHEN** the user taps a selectable row
- **THEN** the item's `photoId` SHALL be added to or removed from the selection set
- **THEN** a selection count label SHALL display the number of selected items

#### Scenario: Selection is cleared when a selected item leaves the queue
- **WHEN** a selected item is removed from the queue (by a delete action or by an in-flight success)
- **THEN** its `photoId` SHALL be pruned from the selection set

#### Scenario: Modal is empty
- **WHEN** the queue becomes empty while the modal is open
- **THEN** the modal SHALL display an empty state ("No pending uploads")
- **THEN** the delete actions SHALL be disabled

### Requirement: Upload queue modal delete selected

The modal SHALL provide a "Delete (N)" action that is enabled when at least one item is selected and disabled (dimmed) otherwise. Confirming it SHALL remove exactly the selected items.

#### Scenario: Delete is gated on selection
- **WHEN** the selection set is empty
- **THEN** the "Delete" button SHALL be rendered dimmed and non-interactive
- **WHEN** the selection set has one or more items
- **THEN** the "Delete (N)" button SHALL be enabled and SHALL display the selected count

#### Scenario: Confirming delete selected
- **WHEN** the user taps "Delete (N)" with N ≥ 1
- **THEN** each selected item SHALL be removed from the queue via `removePendingItem`
- **THEN** the selection set SHALL be reset
- **THEN** the modal SHALL remain open showing the remaining items

### Requirement: Upload queue modal delete all

The modal SHALL provide a "Delete All" action that is enabled only when nothing is selected (dimmed + disabled while ≥1 selected) and SHALL confirm via `showConfirmAlert` before clearing.

#### Scenario: Delete All is disabled while items are selected
- **WHEN** the selection set has one or more items
- **THEN** the "Delete All" button SHALL be rendered dimmed and non-interactive

#### Scenario: Delete All confirms before clearing
- **WHEN** the user taps "Delete All" with an empty selection
- **THEN** a confirm alert SHALL be shown describing the full queue breakdown
- **WHEN** the user confirms
- **THEN** `clearPendingQueue` SHALL be called
- **THEN** the modal SHALL display the empty state

#### Scenario: Delete all is cancelled
- **WHEN** the user dismisses the confirm alert
- **THEN** the queue SHALL be unchanged

### Requirement: Closing the modal resumes the queue

Closing the `UploadQueueModal` by any means SHALL resume the upload queue and reset the selection.

#### Scenario: Close button resumes
- **WHEN** the user taps the modal's close button
- **THEN** the modal SHALL dismiss
- **THEN** the selection set SHALL be reset
- **THEN** `resumeUploads` SHALL be called

#### Scenario: Overlay tap resumes
- **WHEN** the user taps the modal overlay outside the card
- **THEN** the modal SHALL dismiss and `resumeUploads` SHALL be called

#### Scenario: Resume is not called while a delete is in progress
- **WHEN** a delete action (selected or all) is still executing
- **THEN** close and overlay taps SHALL be ignored until the delete completes
