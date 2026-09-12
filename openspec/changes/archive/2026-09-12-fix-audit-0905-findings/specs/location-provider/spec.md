## MODIFIED Requirements

### Requirement: Location Provider Hook
The system SHALL provide a `useLocationProvider` hook at `src/hooks/useLocationProvider.js` that manages location permission, fast-seed, 3-phase watcher lifecycle, and accuracy-gated atom updates. It SHALL be called once from the root `_layout.tsx`. The permission request SHALL handle Mac Catalyst where `requestForegroundPermissionsAsync` hangs by falling back to `getForegroundPermissionsAsync` with a timeout. If BOTH the initial request and the fallback `getForegroundPermissionsAsync` call time out, the hook SHALL NOT assume `'granted'`; it SHALL resolve the permission status to `'unknown'` and SHALL re-check the permission on the next trigger (e.g., the next foreground transition or an explicit re-request) rather than proceeding as if location were available.

#### Scenario: App startup permission request
- **WHEN** `useLocationProvider` is called on app mount
- **THEN** it SHALL call `Location.requestForegroundPermissionsAsync()` with a ~5 second timeout via `Promise.race`
- **THEN** if the call resolves within the timeout, use the returned status
- **THEN** if the call times out (Mac Catalyst), it SHALL fall back to `Location.getForegroundPermissionsAsync()` with the same timeout
- **THEN** if the fallback also times out, it SHALL set the permission status to `'unknown'` and SHALL NOT proceed as granted
- **THEN** if permission is granted, it SHALL proceed to fast-seed and watcher setup
- **THEN** if permission is denied, it SHALL set the atom to `{ status: 'denied', coords: null, accuracy: null }`

#### Scenario: Unknown permission is re-checked
- **WHEN** the permission status resolved to `'unknown'` due to a timeout
- **THEN** on the next foreground transition or explicit re-request, the hook SHALL re-run the permission check
- **THEN** once a definitive status (granted or denied) is obtained, the hook SHALL proceed or deny accordingly

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
