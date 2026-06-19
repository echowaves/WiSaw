## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for location provider in WiSaw.

## Requirements

### Requirement: Location Atom
The system SHALL provide a global Jotai atom `locationAtom` in `src/state.js` that stores the device's location state as an object with `status`, `coords`, and `accuracy` properties.

#### Scenario: Initial atom state
- **WHEN** the app starts
- **THEN** the `locationAtom` SHALL have value `{ status: 'pending', coords: null, accuracy: null }`

#### Scenario: Location obtained
- **WHEN** valid GPS coordinates are received (via last-known position or watcher)
- **THEN** the atom SHALL be set to `{ status: 'ready', coords: { latitude, longitude }, accuracy: <meters> }`
- **THEN** `accuracy` SHALL be the horizontal accuracy in meters from the location fix's `coords.accuracy`

#### Scenario: Permission denied
- **WHEN** the user denies foreground location permission
- **THEN** the atom SHALL be set to `{ status: 'denied', coords: null, accuracy: null }`

### Requirement: Location Provider Hook
The system SHALL provide a `useLocationProvider` hook at `src/hooks/useLocationProvider.js` that manages location permission, fast-seed, 3-phase watcher lifecycle, and accuracy-gated atom updates. It SHALL be called once from the root `_layout.tsx`. The permission request SHALL handle Mac Catalyst where `requestForegroundPermissionsAsync` hangs by falling back to `getForegroundPermissionsAsync` with a timeout.

#### Scenario: App startup permission request
- **WHEN** `useLocationProvider` is called on app mount
- **THEN** it SHALL call `Location.requestForegroundPermissionsAsync()` with a ~5 second timeout via `Promise.race`
- **THEN** if the call resolves within the timeout, use the returned status
- **THEN** if the call times out (Mac Catalyst), it SHALL fall back to `Location.getForegroundPermissionsAsync()` with the same timeout
- **THEN** if the fallback also times out, it SHALL assume `'granted'`
- **THEN** if permission is granted, it SHALL proceed to fast-seed and watcher setup
- **THEN** if permission is denied, it SHALL set the atom to `{ status: 'denied', coords: null, accuracy: null }`

#### Scenario: Fast-seed with last known position
- **WHEN** permission is granted
- **THEN** the hook SHALL call `Location.getLastKnownPositionAsync()`
- **THEN** if a valid position is returned, the atom SHALL be immediately set to `{ status: 'ready', coords: { latitude, longitude }, accuracy: <meters> }`
- **THEN** the Phase 2 refinement watcher SHALL be started

#### Scenario: Phase 2 refinement watcher
- **WHEN** permission is granted and fast-seed is complete
- **THEN** the hook SHALL start a watcher with `Accuracy.High`, `distanceInterval: 0`, `timeInterval: 1000`
- **THEN** on each callback, the hook SHALL compare the new fix's accuracy against the stored accuracy
- **THEN** the atom SHALL only be updated if the new accuracy is less than or equal to the stored accuracy (lower = better)
- **THEN** Phase 2 SHALL end when accuracy drops below 50 meters OR 30 seconds have elapsed
- **THEN** the Phase 2 watcher SHALL be removed and Phase 3 SHALL be started

#### Scenario: Phase 3 maintenance watcher
- **WHEN** Phase 2 ends (accuracy threshold met or timeout)
- **THEN** the hook SHALL start a watcher with `Accuracy.Balanced`, `distanceInterval: 100`, `timeInterval: 60000`
- **THEN** on each callback, the atom SHALL only be updated if the new accuracy is less than or equal to the stored accuracy

#### Scenario: Accuracy-gated updates prevent regression
- **WHEN** a watcher callback provides a fix with worse accuracy than the currently stored value
- **THEN** the atom SHALL NOT be updated
- **THEN** the worse fix SHALL be silently discarded

#### Scenario: Watcher startup fails
- **WHEN** `Location.watchPositionAsync` throws an error
- **THEN** the hook SHALL wait 5 seconds and retry
- **THEN** the hook SHALL retry up to 3 times total
- **THEN** if all retries are exhausted, the atom SHALL remain in its current state

#### Scenario: Watcher cleanup on unmount
- **WHEN** the root layout unmounts (app closing)
- **THEN** all active watcher subscriptions (Phase 2 or Phase 3) SHALL be removed to prevent memory leaks
- **THEN** any pending Phase 2 timeout SHALL be cleared

#### Scenario: Phase 2 transition executes exactly once
- **WHEN** Phase 2 watcher callbacks or the timeout trigger `transitionToPhase3()`
- **THEN** the transition SHALL execute only on the first invocation
- **THEN** subsequent calls to `transitionToPhase3()` SHALL be silently ignored
- **THEN** exactly one Phase 3 watcher SHALL be started

#### Scenario: Phase 2 timeout accommodates cold GPS
- **WHEN** Phase 2 starts on a real device with cold GPS
- **THEN** the timeout SHALL be 60 seconds to allow satellite acquisition
- **THEN** the timeout SHALL still be overridden by early exit when accuracy ≤ 50 meters

#### Scenario: Phase 3 transition resets accuracy gate
- **WHEN** Phase 2 ends and the hook transitions to Phase 3
- **THEN** `storedAccuracyRef` SHALL be reset to `Infinity` before the Phase 3 watcher is started
- **THEN** Phase 3 Balanced-accuracy fixes SHALL be accepted immediately, regardless of the accuracy achieved during Phase 2

### Requirement: Permission Denied UI
The system SHALL show distinct UI when location permission is denied, prompting the user to enable location access. The alert SHALL include both an "Open Settings" button (for iOS) and text instructions for macOS (System Settings → Privacy & Security → Location Services), since the same app binary runs on both platforms via Mac Catalyst.

#### Scenario: Permission denied alert
- **WHEN** the user denies location permission on any platform
- **THEN** an Alert SHALL be shown explaining that location is needed for nearby photos
- **THEN** the alert SHALL include an "Open Settings" button that calls `Linking.openSettings()`
- **THEN** the alert SHALL include text instructions for macOS users to navigate System Settings → Privacy & Security → Location Services
- **THEN** the alert SHALL include an "OK" dismiss button

### Requirement: Development logging
The hook SHALL log phase transitions and watcher callbacks to the console when `__DEV__` is true. Logs SHALL be stripped from production builds automatically by the bundler.

#### Scenario: Phase transition logging
- **WHEN** `__DEV__` is true and a phase transition occurs (Phase 1 seed, Phase 2 start, Phase 2→3 transition, Phase 3 start)
- **THEN** a console log SHALL be emitted with the phase name and current accuracy/coords

#### Scenario: Watcher callback logging
- **WHEN** `__DEV__` is true and a Phase 2 or Phase 3 watcher callback fires
- **THEN** a console log SHALL be emitted with the fix accuracy, coordinates, and whether the fix was accepted or rejected by the gate

### Requirement: Fast-seed Timeout (MODIFIED)
The system SHALL enforce a 5 second timeout on `Location.getLastKnownPositionAsync()` to prevent indefinite blocking during app startup on fresh device boot.

#### Scenario: Fast-seed timeout behavior (MODIFIED)
- **WHEN** `Location.getLastKnownPositionAsync()` is called during Phase 1
- **THEN** the call SHALL be wrapped in a 5 second timeout using `Promise.race()`
- **THEN** if the call completes within 5 seconds with a valid position, the atom SHALL be set to `{ status: 'ready', ... }`
- **THEN** if the call times out (5 seconds elapsed), the system SHALL proceed to Phase 2 without using the last-known position
- **THEN** a dev log SHALL be emitted: `[Location] Phase 1 timeout: no last known position available`

### Requirement: Phase 3 Watcher Setup Timeout (MODIFIED)
The system SHALL enforce a 10 second timeout on `Location.watchPositionAsync()` during Phase 3 setup with retry logic.

#### Scenario: Phase 3 setup timeout (MODIFIED)
- **WHEN** `Location.watchPositionAsync()` is called during Phase 3
- **THEN** the call SHALL be wrapped in a 10 second timeout using `Promise.race()`
- **THEN** if the call succeeds within 10 seconds, the watcher SHALL be started successfully
- **THEN** if the call times out (10 seconds elapsed), the system SHALL retry up to 3 times with 5 second delays
- **THEN** if all 3 retries are exhausted, the system SHALL set the atom to `{ status: 'unavailable', coords: null, accuracy: null }`
- **THEN** a dev log SHALL be emitted for each timeout: `[Location] Phase 3 setup timeout, attempt <n>/3`

### Requirement: Watchdog Mechanism (NEW)
The system SHALL include a watchdog mechanism to detect when the Phase 3 watcher stops receiving location updates and automatically restart it.

#### Scenario: Watchdog detects no updates (NEW)
- **WHEN** the Phase 3 watcher is active and receiving callbacks
- **THEN** the system SHALL record the timestamp of each successful callback
- **THEN** every 15 seconds, the system SHALL check if more than 30 seconds have passed since the last callback
- **THEN** if no updates have been received for 30+ seconds, the system SHALL restart the Phase 3 watcher
- **THEN** the restart SHALL follow the same retry logic (up to 3 retries with 5 second delays)
- **THEN** a dev log SHALL be emitted: `[Location] Watchdog: restarting watcher after no updates for 30+ seconds`

#### Scenario: Watchdog does not apply to Phase 2 (NEW)
- **WHEN** the Phase 2 watcher is active
- **THEN** the watchdog mechanism SHALL NOT apply
- **THEN** Phase 2 timeout (60 seconds) is the only timeout mechanism for this phase

### Requirement: Global Initialization Timeout (NEW)
The total location initialization process SHALL have a maximum 15 second timeout to prevent indefinite hanging.

#### Scenario: Global initialization timeout (NEW)
- **WHEN** the location provider starts initialization
- **THEN** a global 15 second timeout SHALL be started
- **THEN** if all initialization phases complete within 15 seconds, the system SHALL proceed normally
- **THEN** if 15 seconds elapse before location is ready, the system SHALL set the atom to `{ status: 'timeout', coords: null, accuracy: null }`
- **THEN** the Phase 2 and Phase 3 watchers SHALL continue running in the background to eventually obtain a location fix
- **THEN** a dev log SHALL be emitted: `[Location] Global initialization timeout: proceeding with watchers`

### Requirement: Status Transition Logging (NEW)
The system SHALL log status transitions for debugging purposes.

#### Scenario: Status transition logging (NEW)
- **WHEN** the status property of `locationAtom` changes
- **THEN** a console log SHALL be emitted with format: `[Location] Status change: <oldStatus> → <newStatus>`

### Requirement: Invalid Transition Handling (NEW)
Invalid status transitions SHALL be ignored with a dev log message.

#### Scenario: Invalid transition ignored (NEW)
- **WHEN** an invalid status transition is attempted
- **THEN** the atom SHALL NOT be updated
- **THEN** a dev log SHALL be emitted: `[Location] Invalid status transition ignored: <from> → <to>`
