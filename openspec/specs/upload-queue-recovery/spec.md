# upload-queue-recovery Specification

## Purpose
Defines the recovery and durability contract for the WiSaw upload queue: queued photos must eventually upload no matter how many times they fail, and the only way an item leaves the queue is a confirmed successful upload or an explicit user action.

## Requirements

### Requirement: Queued photos are never automatically deleted
A queue item SHALL be removed from the upload queue only (a) after its upload has been confirmed successful, or (b) by an explicit user action (clearing the queue). No code path SHALL remove a queue item because it failed, timed out, was stuck, or encountered an error.

#### Scenario: Item fails repeatedly
- **WHEN** a queue item's upload fails
- **THEN** the item SHALL remain in the queue
- **THEN** the item SHALL be retried on a later processing attempt

#### Scenario: Stuck-item health check observes a long-failed item
- **WHEN** a periodic health check observes a queue item whose last failure is older than the stuck threshold
- **THEN** the health check SHALL NOT remove the item from the queue
- **THEN** the health check SHALL log a warning
- **THEN** the health check SHALL re-drive queue processing if the item is still pending and the network is available

#### Scenario: Transient error mentions a missing file
- **WHEN** an upload attempt fails with an error whose message contains file-missing text (for example a transient server or network error)
- **THEN** the item SHALL remain in the queue and be retried
- **THEN** error-message text alone SHALL NOT be treated as evidence that the local file is gone

### Requirement: Retry-until-success processing
The processing loop SHALL continue attempting the head of the queue until each item either uploads successfully or is classified as unrecoverable. Retry timing SHALL use the existing backoff behavior (exponential backoff with a cap, and a pause after a threshold of consecutive failures on the same item).

#### Scenario: Item succeeds after several failures
- **WHEN** a queue item fails N times and then a subsequent attempt completes the full upload cycle
- **THEN** the item SHALL be removed from the queue
- **THEN** an upload completion event SHALL be emitted exactly once

#### Scenario: App is suspended while retries are pending
- **WHEN** the app is suspended or killed while the queue is non-empty
- **THEN** the queue metadata SHALL persist to disk (expo-storage)
- **THEN** on the next app launch the queue SHALL be restored and processing SHALL resume

### Requirement: Unrecoverable items are skipped, not deleted
A queue item whose local media file no longer exists on disk SHALL be classified as unrecoverable. The processing loop SHALL skip past unrecoverable items without retrying them within the pass, so that recoverable items behind them in the queue continue to upload. Unrecoverable items SHALL remain in the queue and visible in the upload banner until the user clears them.

#### Scenario: Head of queue has a missing file
- **WHEN** the processing loop reaches an item whose local media file does not exist
- **THEN** the loop SHALL mark the item as unrecoverable (persisted on the queue entry)
- **THEN** the loop SHALL proceed to the next queue item without scheduling a retry for the unrecoverable item
- **THEN** the unrecoverable item SHALL NOT be removed from the queue

#### Scenario: Unrecoverable item does not count toward failure pause
- **WHEN** the processing loop skips an unrecoverable item
- **THEN** the skip SHALL NOT increment the consecutive-failure counter
- **THEN** the skip SHALL NOT trigger the consecutive-failure pause

#### Scenario: Recoverable item behind an unrecoverable item still uploads
- **WHEN** the queue contains an unrecoverable item followed by a valid item
- AND the network is available
- **THEN** the valid item SHALL be processed and uploaded without waiting for the unrecoverable item

#### Scenario: File existence is checked by verifying the actual file
- **WHEN** the system determines whether an item is unrecoverable
- **THEN** it SHALL check the actual existence of the item's local media file on disk
- **THEN** it SHALL NOT infer missing-file status from error-message text

### Requirement: Foreground re-drive of the queue
When the app transitions to the active (foreground) state and the queue is non-empty, the system SHALL re-drive queue processing so that uploads resume after suspension, kill, or a lapsed in-memory retry timer.

#### Scenario: App returns to foreground with pending items
- **WHEN** the app state transitions to active
- **AND** the queue is non-empty
- **THEN** the system SHALL invoke queue processing

#### Scenario: App returns to foreground with an empty queue
- **WHEN** the app state transitions to active
- **AND** the queue is empty
- **THEN** the system SHALL NOT start a processing pass

### Requirement: Upload cycle is resumable
The per-item upload cycle consists of three steps: preparing the local file, creating the backend photo record, and uploading the file to storage. The cycle SHALL be safe to re-run from the beginning after any mid-cycle failure or app termination: a backend photo record creation with an existing photo identifier SHALL return the existing record rather than failing, and a storage upload URL SHALL be re-requested on every upload attempt rather than reused from a previous attempt.

#### Scenario: Failure between record creation and storage upload
- **WHEN** the backend photo record for an item has been created but the storage upload has not completed
- **AND** the next processing attempt runs
- **THEN** the attempt SHALL NOT attempt to create the photo record again as a new record
- **THEN** the attempt SHALL detect the existing record and proceed to the storage upload step

#### Scenario: Storage upload URL expired
- **WHEN** a storage upload attempt fails because the previously requested upload URL is no longer valid
- **THEN** the next attempt SHALL request a fresh upload URL before retrying the upload

#### Scenario: Failure before record creation
- **WHEN** the backend photo record for an item does not yet exist
- **THEN** the processing attempt SHALL create it using the item's stable photo identifier

### Requirement: Queue is surfaced and cleared only by the user
The global upload banner SHALL include unrecoverable (skipped) items in its pending count. The queue SHALL be cleared only when the user explicitly long-presses the banner and confirms the clear action.

#### Scenario: Banner count includes skipped items
- **WHEN** the queue contains both uploadable and unrecoverable items
- **THEN** the banner's pending count SHALL include the unrecoverable items

#### Scenario: User clears the queue
- **WHEN** the user long-presses the upload banner and confirms the clear action
- **THEN** all queue items SHALL be removed
- **THEN** the local media files of cleared items SHALL be deleted

#### Scenario: No automatic clear
- **WHEN** items have been pending, failed, or unrecoverable for any duration
- **AND** the user has not initiated a clear
- **THEN** the items SHALL remain in the queue
