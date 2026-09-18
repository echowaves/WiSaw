## Purpose
This specification defines timeout behaviors, watchdog mechanisms, and acceptable initialization durations for the location provider in WiSaw.

## Requirements

### Requirement: Location Provider Timeouts
The location provider SHALL enforce a global maximum duration for initialization to prevent indefinite blocking, and SHALL rely on the first-fix watchdog (see the `location-provider` capability) rather than per-call race timeouts: `getLastKnownPositionAsync` is a synchronous cached-position read (verified non-hang in `expo-location@57.0.11`) and watcher registration resolves immediately on both platforms, so neither call needs a race timeout — the failure mode is a registered watcher that never delivers a fix.

#### Scenario: Phase 1 timeout for last known position
- **WHEN** `Location.getLastKnownPositionAsync()` is called during Phase 1
- **THEN** the call SHALL be awaited directly, without a race timeout (it is a synchronous cached-position read that resolves with a position or null)
- **THEN** if a valid position is returned, the atom SHALL be set to `{ status: 'ready', ... }`
- **THEN** if null is returned, the system SHALL proceed to Phase 2 without a last-known position
- **THEN** if the call throws an error, the system SHALL proceed to Phase 2 without a last-known position

#### Scenario: Phase 3 watcher setup timeout
- **WHEN** `Location.watchPositionAsync()` is called during Phase 3 setup
- **THEN** the await SHALL be protected by the existing throw/retry logic (3 retries, 5s delays) but SHALL NOT be wrapped in a race timeout (registration resolves as soon as the streamer/request is registered)
- **THEN** a registered watcher that never delivers a fix SHALL be handled by the first-fix watchdog, not by a setup timeout

#### Scenario: Phase 2 timeout remains unchanged
- **WHEN** Phase 2 (refinement) is running
- **THEN** the existing 60 second timeout SHALL remain in place
- **THEN** the timeout SHALL still be overridden by early exit when accuracy ≤ 50 meters

### Requirement: Watchdog Mechanism
The location provider SHALL include a watchdog mechanism on the Phase 3 maintenance watcher that detects when no location fix has ever been received despite an active watcher, and restarts the watcher up to a bounded number of times. The watchdog is active only while the atom has no fix (status is not `ready`).

#### Scenario: Watchdog detects no updates
- **WHEN** the Phase 3 watcher is registered and the atom has no fix (status is `pending` or `timeout`)
- **THEN** the system SHALL record the timestamp when the current watcher was registered
- **THEN** every 15 seconds, the system SHALL check if more than 30 seconds have passed since the current watcher was registered
- **THEN** if no fix has been received in that window, the system SHALL restart the Phase 3 watcher (remove and re-register the same phase)
- **THEN** the restart budget SHALL be at most 3 attempts total
- **THEN** when the budget is exhausted, the system SHALL set the atom to `{ status: 'unavailable', coords: null, accuracy: null }` and stop the watchdog

#### Scenario: Watchdog does not trigger during Phase 2
- **WHEN** the Phase 2 watcher is active
- **THEN** the watchdog mechanism SHALL NOT apply to Phase 2
- **THEN** the Phase 2 timeout (60 seconds) is the only timeout mechanism for this phase; on expiry the provider transitions to Phase 3, where the watchdog becomes active if no fix has arrived

#### Scenario: Watchdog does not trigger after status change
- **WHEN** the atom status becomes `ready` (a first fix is accepted), `unavailable` (watchdog budget exhausted), or `denied`
- **THEN** the watchdog mechanism SHALL be stopped
- **THEN** no further watchdog checks SHALL be performed until the next foreground re-initialization
- **THEN** maintenance-mode update gaps after `ready` (e.g. a stationary user producing no 1000 m / 300 s Phase 3 triggers) SHALL NOT cause watcher restarts

### Requirement: Initialization Timeout
The total location initialization process SHALL have a maximum duration to prevent indefinite hanging.

#### Scenario: Global initialization timeout
- **WHEN** the location provider starts initialization
- **THEN** a global 15 second timeout SHALL be started
- **THEN** if a fix is obtained within 15 seconds, the system SHALL proceed normally and the timeout SHALL be cleared
- **THEN** if 15 seconds elapse before a fix is obtained, the system SHALL set the atom to `{ status: 'timeout', coords: null, accuracy: null }`
- **THEN** the Phase 2 and Phase 3 watchers SHALL continue running in the background to eventually obtain a location fix
- **THEN** if a fix is obtained after the timeout, the atom SHALL transition from `timeout` to `ready`

#### Scenario: Timeout allows continued background operation
- **WHEN** the global initialization timeout is reached
- **THEN** the system SHALL NOT cancel pending watchers
- **THEN** the watchdog SHALL remain armed (a late fix still disarms it)
- **THEN** the feed UI SHALL indicate that location is still being found (see `photo-feed` capability)

### Requirement: Timeout Logging
The location provider SHALL log timeout and watchdog events to assist with debugging.

#### Scenario: Phase 1 timeout logging
- **WHEN** `Location.getLastKnownPositionAsync()` returns null or throws during Phase 1
- **THEN** a console log SHALL be emitted with format: `[Location] Phase 1: no last known position available, proceeding to Phase 2`
- **NOTE**: no race timeout is applied to this call (see revised `Location Provider Timeouts` requirement), so this log marks the fast-seed miss, not a timeout

#### Scenario: Phase 3 setup timeout logging
- **WHEN** `Location.watchPositionAsync()` throws during Phase 3 setup and a retry is scheduled
- **THEN** a console log SHALL be emitted with format: `[Location] Phase 3 setup failed, attempt <n>/3: <error>`
- **NOTE**: no race timeout is applied to registration (see revised `Location Provider Timeouts` requirement); the no-fix case is logged by the watchdog instead

#### Scenario: Global initialization timeout logging
- **WHEN** the global initialization timeout is reached
- **THEN** a console log SHALL be emitted with format: `[Location] Global initialization timeout: proceeding with watchers`

#### Scenario: Watchdog timeout logging
- **WHEN** the watchdog restarts the Phase 3 watcher or gives up
- **THEN** a console log SHALL be emitted with format: `[Location] Watchdog: no fix after 30+ seconds, restarting watcher (attempt <n>/3)` or `[Location] Watchdog: no fix after 3 restarts — marking location unavailable`
