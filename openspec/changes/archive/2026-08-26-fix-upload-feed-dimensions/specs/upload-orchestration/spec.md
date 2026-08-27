## ADDED Requirements

### Requirement: Upload queue pass is re-entrancy guarded
`processQueue` SHALL detect that a queue pass is already in flight and return without starting a second pass. Concurrent triggers (photo capture enqueue, network re-availability, screen refresh) SHALL NOT interleave two processing loops over the same queue.

#### Scenario: processQueue called while a pass is running
- **WHEN** `processQueue` is invoked while a previous invocation has not finished
- **THEN** the new invocation SHALL return immediately without processing any items
- **THEN** the in-flight pass SHALL continue undisturbed

#### Scenario: processQueue runs after a pass finished
- **WHEN** `processQueue` is invoked after the previous pass has completed and released its in-flight flag
- **THEN** the new invocation SHALL process the queue normally
