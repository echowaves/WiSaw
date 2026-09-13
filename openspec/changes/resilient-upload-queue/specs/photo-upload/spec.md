## MODIFIED Requirements

### Requirement: Geo Coordinate Validation at Upload Time
The system SHALL validate that queued photos have valid geo coordinates before submitting the `createPhoto` GraphQL mutation. Coordinates SHALL originate from the global `locationAtom` at capture time. A queued item with null, missing, or zero coordinates can never become valid (coordinates are snapshotted at capture time), so it SHALL be classified as unrecoverable: the processing loop SHALL skip past it without retrying, and the item SHALL remain in the queue and visible in the upload banner until the user clears it. The user SHALL be shown a message indicating the photo cannot be uploaded due to missing location.

#### Scenario: Queued item has valid coordinates
- **WHEN** a queued photo has non-zero latitude and longitude in its location data (sourced from `locationAtom.coords` at capture time)
- **THEN** the upload SHALL proceed normally

#### Scenario: Queued item has null or missing location
- **WHEN** a queued photo has `null`, `undefined`, or missing location data
- **THEN** the upload SHALL be rejected for that item
- **THEN** the item SHALL be marked unrecoverable and skipped by the processing loop
- **THEN** the item SHALL remain in the queue and count toward the banner pending total
- **THEN** the user SHALL be shown a message indicating the photo was skipped due to missing location

#### Scenario: Queued item has zero coordinates
- **WHEN** a queued photo has latitude and longitude both equal to 0
- **THEN** the upload SHALL be rejected for that item
- **THEN** the item SHALL be marked unrecoverable and skipped by the processing loop
- **THEN** the item SHALL remain in the queue and count toward the banner pending total
- **THEN** the user SHALL be shown a message indicating the photo was skipped due to missing location

#### Scenario: Unrecoverable location item does not block the queue
- **WHEN** a queue item with invalid coordinates sits at the head of the queue
- AND a valid item follows it
- AND the network is available
- **THEN** the valid item SHALL be processed and uploaded without waiting for the invalid-coordinates item

## ADDED Requirements

### Requirement: Captured media is persisted to a stable local path at enqueue time
When a photo or video is captured and enqueued for upload, the system SHALL copy the captured file from its camera temp location into the app's pending-uploads folder before the queue entry is persisted. The queue entry SHALL reference the stable pending-uploads path, so that the upload pipeline does not depend on the OS retaining the camera temp file. The temp file copy SHALL happen synchronously with enqueue: if the copy fails, the enqueue SHALL fail and the user SHALL be notified (the capture SHALL NOT be silently dropped from the queue with an unusable path).

#### Scenario: Capture enqueued while online
- **WHEN** the user captures a photo and the file copy into the pending-uploads folder succeeds
- **THEN** the queue entry SHALL store the pending-uploads folder path as the source file
- **THEN** the upload pipeline SHALL read the source file from the pending-uploads folder

#### Scenario: Capture enqueued while offline
- **WHEN** the user captures a photo while the device is offline
- **THEN** the file SHALL still be copied into the pending-uploads folder at enqueue time
- **THEN** the queue entry SHALL be persisted for upload when connectivity returns

#### Scenario: File copy fails at enqueue time
- **WHEN** the file copy into the pending-uploads folder fails (for example, disk full)
- **THEN** the enqueue SHALL NOT persist a queue entry pointing at the temp file
- **THEN** the user SHALL be shown an error indicating the capture could not be saved for upload
