## Purpose
This specification defines timeout behaviors, watchdog mechanisms, and acceptable initialization durations for the location provider in WiSaw.

## Requirements

### Requirement: Location Provider Timeouts
The location provider SHALL enforce maximum durations for each initialization phase to prevent indefinite blocking. If a phase exceeds its timeout, the system SHALL proceed to the next phase or fail gracefully.

#### Scenario: Phase 1 timeout for last known position
- **WHEN** `Location.getLastKnownPositionAsync()` is called during Phase 1
- **THEN** the call SHALL be wrapped in a 5 second timeout using `Promise.race()`
- **THEN** if the call completes within 5 seconds with a valid position, the atom SHALL be set to `{ status: 'ready', ... }`
- **THEN** if the call times out (5 seconds elapsed), the system SHALL proceed to Phase 2 without using the last-known position
- **THEN** if the call throws an error, the system SHALL proceed to Phase 2 without using the last-known position

#### Scenario: Phase 3 watcher setup timeout
- **WHEN** `Location.watchPositionAsync()` is called during Phase 3
- **THEN** the call SHALL be wrapped in a 10 second timeout using `Promise.race()`
- **THEN** if the call completes within 10 seconds, the watcher SHALL be started successfully
- **THEN** if the call times out (10 seconds elapsed), the system SHALL retry up to 3 times with 5 second delays
- **THEN** if all 3 retries are exhausted, the system SHALL set the atom to `{ status: 'unavailable', coords: null, accuracy: null }`

#### Scenario: Phase 2 timeout remains unchanged
- **WHEN** Phase 2 (high-accuracy refinement) is running
- **THEN** the existing 60 second timeout SHALL remain in place
- **THEN** the timeout SHALL still be overridden by early exit when accuracy ≤ 50 meters

### Requirement: Watchdog Mechanism
The location provider SHALL include a watchdog mechanism to detect when the active watcher stops receiving location updates.

#### Scenario: Watchdog detects no updates
- **WHEN** the Phase 3 watcher is active and receiving callbacks
- **THEN** the system SHALL record the timestamp of each successful callback
- **THEN** every 15 seconds, the system SHALL check if more than 30 seconds have passed since the last callback
- **THEN** if no updates have been received for 30+ seconds, the system SHALL restart the Phase 3 watcher
- **THEN** the restart SHALL follow the same retry logic as Phase 3 setup (up to 3 retries)

#### Scenario: Watchdog does not trigger during Phase 2
- **WHEN** the Phase 2 watcher is active
- **THEN** the watchdog mechanism SHALL NOT apply
- **THEN** Phase 2 timeout (60 seconds) is the only timeout mechanism for this phase

#### Scenario: Watchdog does not trigger after status change
- **WHEN** the location atom status changes from 'ready' to 'denied' or 'unavailable'
- **THEN** the watchdog mechanism SHALL be stopped
- **THEN** no further watchdog checks SHALL be performed

### Requirement: Initialization Timeout
The total location initialization process SHALL have a maximum duration to prevent indefinite hanging.

#### Scenario: Global initialization timeout
- **WHEN** the location provider starts initialization
- **THEN** a global 15 second timeout SHALL be started
- **THEN** if all initialization phases complete within 15 seconds, the system SHALL proceed normally
- **THEN** if 15 seconds elapse before location is ready, the system SHALL set the atom to `{ status: 'timeout', coords: null, accuracy: null }`
- **THEN** the Phase 2 and Phase 3 watchers SHALL continue running in the background to eventually obtain a location fix

#### Scenario: Timeout allows continued background operation
- **WHEN** the global initialization timeout is reached
- **THEN** the system SHALL NOT cancel pending watchers
- **THEN** the Phase 2 and Phase 3 watchers SHALL continue running to eventually obtain a location fix
- **THEN** if a location fix is obtained after the timeout, the atom SHALL be updated to `{ status: 'ready', ... }`

### Requirement: Timeout Logging
The location provider SHALL log timeout events to assist with debugging.

#### Scenario: Phase 1 timeout logging
- **WHEN** `Location.getLastKnownPositionAsync()` times out
- **THEN** a console log SHALL be emitted with format: `[Location] Phase 1 timeout: no last known position available`

#### Scenario: Phase 3 setup timeout logging
- **WHEN** `Location.watchPositionAsync()` times out during Phase 3
- **THEN** a console log SHALL be emitted with format: `[Location] Phase 3 setup timeout, attempt <n>/3`

#### Scenario: Global initialization timeout logging
- **WHEN** the global initialization timeout is reached
- **THEN** a console log SHALL be emitted with format: `[Location] Global initialization timeout: proceeding with watchers`

#### Scenario: Watchdog timeout logging
- **WHEN** the watchdog detects no updates for 30+ seconds
- **THEN** a console log SHALL be emitted with format: `[Location] Watchdog: restarting watcher after no updates for <seconds> seconds`
