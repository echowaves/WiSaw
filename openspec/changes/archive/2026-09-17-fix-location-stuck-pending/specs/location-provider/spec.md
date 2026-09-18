## MODIFIED Requirements

### Requirement: Location Provider Hook
The system SHALL provide a `useLocationProvider` hook at `src/hooks/useLocationProvider.js` that manages location permission, fast-seed, 3-phase watcher lifecycle, and accuracy-gated atom updates. It SHALL be called once from the root `_layout.tsx`. The permission request SHALL handle Mac Catalyst where `requestForegroundPermissionsAsync` hangs by falling back to `getForegroundPermissionsAsync` with a timeout. If BOTH the initial request and the fallback `getForegroundPermissionsAsync` call time out, the hook SHALL NOT assume `'granted'`; it SHALL resolve the permission status to `'unknown'` and SHALL re-check the permission on a repeating ~15 second timer AND on the next foreground transition, rather than proceeding as if location were available.

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
- **THEN** the hook SHALL re-run the permission check every ~15 seconds while the status remains `'unknown'`, regardless of foreground transitions
- **THEN** the hook SHALL ALSO re-run the permission check on the next foreground transition
- **THEN** once a definitive status (granted or denied) is obtained, the hook SHALL stop re-checking and SHALL proceed or deny accordingly
- **THEN** the re-check timer SHALL be cleared when a definitive status is obtained or on unmount

#### Scenario: Fast-seed with last known position
- **WHEN** permission is granted
- **THEN** the hook SHALL call `Location.getLastKnownPositionAsync()`
- **THEN** if a valid position is returned, the atom SHALL be immediately set to `{ status: 'ready', coords: { latitude, longitude }, accuracy: <meters> }`
- **THEN** the Phase 2 refinement watcher SHALL be started

#### Scenario: Phase 2 refinement watcher
- **WHEN** permission is granted and fast-seed is complete
- **THEN** the hook SHALL start a watcher with `Accuracy.Coarse`, `distanceInterval: 500`, `timeInterval: 120000`
- **THEN** on each callback, the hook SHALL compare the new fix's accuracy against the stored accuracy
- **THEN** the atom SHALL only be updated if the new accuracy is less than or equal to the stored accuracy (lower = better)
- **THEN** Phase 2 SHALL end when accuracy drops below 50 meters OR 60 seconds have elapsed
- **THEN** the Phase 2 watcher SHALL be removed and Phase 3 SHALL be started

#### Scenario: Phase 3 maintenance watcher
- **WHEN** Phase 2 ends (accuracy threshold met or timeout)
- **THEN** the hook SHALL start a watcher with `Accuracy.Coarse`, `distanceInterval: 1000`, `timeInterval: 300000`
- **THEN** on each callback, the atom SHALL only be updated if the new accuracy is less than or equal to the stored accuracy

#### Scenario: Accuracy-gated updates prevent regression
- **WHEN** a watcher callback provides a fix with worse accuracy than the currently stored value
- **THEN** the atom SHALL NOT be updated
- **THEN** the worse fix SHALL be silently discarded

#### Scenario: Watcher startup fails
- **WHEN** `Location.watchPositionAsync` throws an error
- **THEN** the hook SHALL wait 5 seconds and retry
- **THEN** the hook SHALL retry up to 3 times total
- **THEN** if all retries are exhausted and the atom still has no fix, the atom SHALL be set to `{ status: 'unavailable', coords: null, accuracy: null }`

#### Scenario: Watcher cleanup on unmount
- **WHEN** the root layout unmounts (app closing)
- **THEN** all active watcher subscriptions (Phase 2 or Phase 3) SHALL be removed to prevent memory leaks
- **THEN** any pending Phase 2 timeout, watchdog interval, and permission re-check timer SHALL be cleared

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
- **THEN** Phase 3 Coarse-accuracy fixes SHALL be accepted immediately, regardless of the accuracy achieved during Phase 2

## ADDED Requirements

### Requirement: First-fix watchdog
The system SHALL detect the case where a watcher is registered but no location fix ever arrives (cold GPS after device reboot, wedged native location service, OS-reported location failure). The watchdog applies to the Phase 3 maintenance watcher only: while the atom has no fix (`status` is not `ready`) and the Phase 3 watcher is active, a watchdog SHALL check every ~15 seconds whether 30+ seconds have passed since the current watcher was registered. If so, the watchdog SHALL restart the Phase 3 watcher (removing the current subscription and re-registering it). Phase 2 is NOT watchdog-monitored — its 60-second timeout always transitions to Phase 3, so it cannot be stuck. The watchdog SHALL allow at most 3 restart attempts in total; when exhausted, the atom SHALL be set to `{ status: 'unavailable', coords: null, accuracy: null }` and the watchdog SHALL stop. When a fix is accepted (atom becomes `ready`), the watchdog SHALL disarm and never restart a watcher again — in maintenance mode a stationary user legitimately produces no updates (Phase 3 distance/time intervals are 1000 m / 300 s).

#### Scenario: No fix arrives while a watcher is registered
- **WHEN** the Phase 3 watcher is active, the atom status is `pending` or `timeout`, and 30+ seconds have passed since the current watcher was registered without any fix
- **THEN** the watchdog SHALL remove the current watcher subscription and re-register the Phase 3 watcher
- **THEN** a dev log SHALL be emitted: `[Location] Watchdog: no fix after 30+ seconds, restarting watcher (attempt <n>/3)`

#### Scenario: Watchdog does not monitor Phase 2
- **WHEN** the Phase 2 refinement watcher is active and no fix has arrived
- **THEN** the watchdog SHALL NOT restart the Phase 2 watcher
- **THEN** the Phase 2 60-second timeout remains the only guard; on expiry the provider transitions to Phase 3 where the watchdog applies

#### Scenario: Watchdog restarts exhausted
- **WHEN** the watchdog has restarted the watcher 3 times and still no fix has arrived
- **THEN** the atom SHALL be set to `{ status: 'unavailable', coords: null, accuracy: null }`
- **THEN** the watchdog SHALL stop checking
- **THEN** a dev log SHALL be emitted: `[Location] Watchdog: no fix after 3 restarts — marking location unavailable`

#### Scenario: Watchdog disarms after first fix
- **WHEN** a location fix is accepted and the atom status becomes `ready`
- **THEN** the watchdog SHALL stop checking
- **THEN** no subsequent 30+ second gaps in maintenance-mode updates SHALL trigger a watcher restart

#### Scenario: Watchdog does not double-restart a healthy start
- **WHEN** a fix arrives within 30 seconds of watcher registration (the normal case)
- **THEN** the watchdog SHALL have performed zero restarts
- **THEN** initialization behavior SHALL be identical to the current behavior

### Requirement: Watcher error surfacing
The hook SHALL register an error handler with every `Location.watchPositionAsync` call so that OS-reported location failures (e.g. CoreLocation `locationUnavailable`/`kCLErrorDomain` errors, FusedLocationProvider failures) are received by the app instead of being dropped. An error received while the atom has no fix SHALL be treated as a watchdog failure: it SHALL immediately trigger a watcher restart (counting against the same 3-attempt budget) rather than waiting for the next 30-second no-fix window. An error received while the atom is `ready` SHALL be logged in dev mode but SHALL NOT change the atom status.

#### Scenario: OS reports location failure while awaiting first fix
- **WHEN** the active watcher's error handler fires while the atom status is not `ready`
- **THEN** the hook SHALL remove the current watcher and restart the same phase's watcher, counting against the 3-attempt watchdog budget
- **THEN** a dev log SHALL be emitted: `[Location] Watcher error while awaiting fix: <reason>`

#### Scenario: OS reports location failure after fix acquired
- **WHEN** the active watcher's error handler fires while the atom status is `ready`
- **THEN** the atom SHALL NOT be modified
- **THEN** a dev log SHALL be emitted with the failure reason

### Requirement: Foreground re-initialization
The hook SHALL re-run the full initialization sequence (permission check, fast-seed, Phase 2) when the app transitions to the `active` foreground state AND the current atom status is `timeout`, `unavailable`, or `denied`. This removes the "restart the app" workaround after the user enables location services in Settings (the primary denial-recovery flow is deny → Settings → enable → return to app), and recovers from a transiently wedged location service.

#### Scenario: App foregrounded after denied
- **WHEN** AppState transitions to `active` and the atom status is `denied`
- **THEN** the hook SHALL re-run the permission check (a non-prompting re-check on iOS/Android once permission has been decided)
- **THEN** if the permission is now granted, the hook SHALL proceed to fast-seed and watcher setup and the atom SHALL transition to `ready` once a fix arrives
- **THEN** if the permission is still denied, the atom SHALL remain `denied` and the existing denied UI SHALL be re-shown

#### Scenario: App foregrounded after timeout
- **WHEN** AppState transitions to `active` and the atom status is `timeout`
- **THEN** the hook SHALL re-run the permission check and, if granted, fast-seed and watcher setup
- **THEN** if a fix is obtained, the atom SHALL transition to `ready` and the feed SHALL reload via the existing `status === 'ready'` effect

#### Scenario: App foregrounded after unavailable
- **WHEN** AppState transitions to `active` and the atom status is `unavailable`
- **THEN** the hook SHALL re-run the permission check and, if granted, fast-seed and watcher setup with a fresh watchdog budget
- **THEN** if no fix is obtained, the atom SHALL remain `unavailable` and the watchdog SHALL again be allowed 3 restart attempts

#### Scenario: Foreground while already ready
- **WHEN** AppState transitions to `active` and the atom status is `ready`
- **THEN** the hook SHALL NOT restart the watcher or re-run initialization
- **THEN** the existing maintenance watcher SHALL continue unchanged

## REMOVED Requirements

### Requirement: Fast-seed Timeout (MODIFIED)
**Reason**: Spec'd in the 2026-06-19 `location-initialization-fix` change and marked done, but never implemented, and based on a false premise: `getLastKnownPositionAsync` is a synchronous read of the cached system position (verified in `expo-location@57.0.11` iOS `LocationModule.swift` and Android `LocationModule.kt`) and cannot hang. The actual stuck-on-pending failure mode is a watcher that registers successfully but never delivers a fix, which this requirement does not address.
**Migration**: No code migration needed — no implementation of this requirement exists. The failure mode it was meant to cover is addressed by the First-fix watchdog requirement in this change.
