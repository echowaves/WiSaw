## Purpose

Define upload batch lifecycle and auto-group flush orchestration: ensure flush fires only after actual uploads, prevent concurrent flush scheduling, and guard against concurrent `runAutoGroup` execution.

## Requirements

### Requirement: Upload completion does not fetch ungrouped photo count
The system SHALL NOT call `getUngroupedPhotosCount` API when photo upload completes. The upload completion handler SHALL only trigger a waves feed refresh via `handleRefresh()`.

#### Scenario: Upload complete event
- **WHEN** a photo upload completes successfully
- **THEN** the system SHALL call `handleRefresh()` to refresh the waves feed
- **THEN** the system SHALL NOT call `getUngroupedPhotosCount`

#### Scenario: No ungrouped count badge update needed
- **WHEN** upload completes
- **THEN** no ungrouped photo count badge update shall be performed
- **THEN** the `ungroupedPhotosCount` Jotai atom shall remain unchanged

### Requirement: Flush scheduled only after actual uploads in a batch

The system SHALL use a single `needsFlushRef` flag that is set to true when `processQueue()` starts with a non-empty queue, and reset in the `finally` block after scheduling the flush. This ensures flush is only triggered when uploads actually occurred, not on empty queue checks.

#### Scenario: Upload batch processes then flush scheduled

- **WHEN** `processQueue()` starts with a non-empty queue
- **THEN** `needsFlushRef.current` SHALL be set to true
- **WHEN** all uploads in the batch complete
- **THEN** the `finally` block SHALL schedule a flush timer (5-second delay)
- **THEN** `needsFlushRef.current` SHALL be reset to false immediately

#### Scenario: Empty queue on startup does not trigger flush

- **WHEN** `processQueue()` is called on app startup and the queue is empty
- **THEN** `needsFlushRef.current` SHALL remain false
- **THEN** no flush timer SHALL be scheduled in the `finally` block

#### Scenario: Multiple processQueue calls do not stack flush timers

- **WHEN** `processQueue()` is called multiple times (e.g., pull-to-refresh, navigation) within the same batch cycle
- **THEN** `needsFlushRef.current` SHALL be overwritten on each entry (idempotent — true if queue has items, false if empty)
- **THEN** at most one flush timer SHALL be scheduled per batch completion

#### Scenario: Grouping disabled skips flush entirely

- **WHEN** `_groupingState.enabled` is false
- **THEN** no flush timer SHALL be scheduled even if `needsFlushRef.current` is true
- **THEN** `needsFlushRef.current` SHALL remain set (no reset without scheduling)

### Requirement: Prevent concurrent runAutoGroup execution

The system SHALL guard `runAutoGroup()` in `WavesHub/index.js` with an `autoGroupRunningRef` to prevent concurrent execution when multiple auto-group events fire.

#### Scenario: Second auto-group trigger while first is running

- **WHEN** `runAutoGroup()` is executing (e.g., triggered by upload flush)
- **WHEN** a second auto-group event fires (e.g., from WavesExplainerView or UngroupedPhotosCard)
- **THEN** the second call SHALL return early without executing
- **THEN** the first call SHALL complete normally

#### Scenario: Auto-group guard resets after completion

- **WHEN** `runAutoGroup()` completes (success or error)
- **THEN** `autoGroupRunningRef.current` SHALL be reset to false in the finally block
- **THEN** subsequent auto-group triggers SHALL be allowed to execute

### Requirement: Local artifact cleanup after successful upload
The system SHALL delete the local files of a queued item (compressed image, generated thumbnail, video, and the original camera file) once that item has been uploaded successfully and removed from the upload queue. File deletion SHALL be best-effort: a deletion failure SHALL NOT re-add the item to the queue, block upload completion, or surface an error to the user.

#### Scenario: Uploaded photo files are deleted
- **WHEN** a queued photo uploads successfully and its queue entry is removed
- **THEN** the system SHALL delete the item's local image, thumbnail, and original camera file
- **THEN** the next queue read SHALL NOT contain the item

#### Scenario: Uploaded video files are deleted
- **WHEN** a queued video uploads successfully and its queue entry is removed
- **THEN** the system SHALL delete the video file, its generated thumbnail, and the original camera file

#### Scenario: File deletion fails
- **WHEN** deleting a local file of a successfully uploaded item throws
- **THEN** the upload is still considered complete
- **THEN** the queue entry is not restored
- **THEN** the failure is logged, not surfaced to the user

### Requirement: Upload queue persistence safety
The stored upload queue SHALL be preserved when the app initializes and the queue cannot be read. A transient storage read error at startup SHALL NOT overwrite the stored queue with an empty one.

#### Scenario: Queue read fails at startup
- **WHEN** the app initializes and reading the pending upload queue throws
- **THEN** the stored queue SHALL NOT be overwritten
- **THEN** the error SHALL be logged
- **THEN** subsequent queue reads (e.g., after storage recovers) SHALL return the original queue contents

#### Scenario: Queue read succeeds with items
- **WHEN** the app initializes and the queue contains pending items
- **THEN** the items SHALL remain queued for upload
- **THEN** items whose local files are missing SHALL be reported in logs but SHALL NOT be silently dropped
