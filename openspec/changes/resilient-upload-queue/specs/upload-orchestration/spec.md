## ADDED Requirements

### Requirement: Queue writes are serialized
All read-modify-write operations on the persisted upload queue (adding a new item, updating an item, removing an item, clearing the queue) SHALL be serialized through a single-writer lock so that concurrent invocations (a processing pass updating items while a new capture enqueues, or a health check re-reading) cannot interleave their reads and writes and cull an entry. Each serialized operation SHALL re-read the queue after acquiring the lock.

#### Scenario: New capture enqueues while a processing pass is updating an item
- **WHEN** a processing pass is mid-flight updating a queue item
- **AND** the user captures a new photo that enqueues a new item
- **THEN** neither operation SHALL overwrite the other
- **THEN** the persisted queue SHALL contain both the updated item and the newly enqueued item

#### Scenario: Clear queue races with an in-flight update
- **WHEN** the user clears the queue while a processing pass is updating an item
- **THEN** the clear SHALL serialize after the in-flight update
- **THEN** no queue entry SHALL be lost due to write interleaving other than by the explicit clear

### Requirement: Queue processing waits for the device UUID
When queue processing starts before the device UUID is available (for example, on cold start before identity has hydrated), the system SHALL wait for the UUID to become available rather than treating the missing UUID as a fatal error. No error toast SHALL be shown for a UUID that has not loaded yet.

#### Scenario: Cold start with pending items before UUID loads
- **WHEN** the app cold-starts with a non-empty queue
- **AND** queue processing begins before the device UUID has hydrated
- **THEN** the system SHALL NOT show an authentication error
- **THEN** processing SHALL begin once the UUID becomes available
- **THEN** pending items SHALL be processed normally

#### Scenario: UUID never available
- **WHEN** the device UUID is empty and no stored identity exists
- **THEN** the system MAY show an error indicating authentication is required
- **THEN** the queue SHALL remain intact for a future session
