## ADDED Requirements

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
