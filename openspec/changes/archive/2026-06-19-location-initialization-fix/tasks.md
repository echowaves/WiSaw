## 1. State Updates

- [x] 1.1 Update `locationAtom` in `src/state.js` to include new status values: `timeout` and `unavailable`
- [x] 1.2 Add `lastUpdate` timestamp field to `locationAtom` for watchdog tracking
- [x] 1.3 Add `initStage` tracking field to `locationAtom` to monitor initialization progress

## 2. Constants and Configuration

- [x] 2.1 Add `PHASE1_TIMEOUT_MS = 5000` constant for Phase 1 timeout
- [x] 2.2 Add `PHASE3_SETUP_TIMEOUT_MS = 10000` constant for Phase 3 watcher setup timeout
- [x] 2.3 Add `GLOBAL_INIT_TIMEOUT_MS = 15000` constant for global initialization timeout
- [x] 2.4 Add `WATCHDOG_CHECK_INTERVAL_MS = 15000` constant for watchdog check interval
- [x] 2.5 Add `WATCHDOG_NO_UPDATE_THRESHOLD_MS = 30000` constant for watchdog no-update threshold

## 3. Phase 1 Timeout Implementation

- [x] 3.1 Wrap `Location.getLastKnownPositionAsync()` call in Phase 1 with `Promise.race()` and 5 second timeout
- [x] 3.2 If Phase 1 times out, log `[Location] Phase 1 timeout: no last known position available`
- [x] 3.3 If Phase 1 times out, proceed to Phase 2 without using last-known position
- [x] 3.4 If Phase 1 throws an error, proceed to Phase 2 without using last-known position

## 4. Phase 3 Watcher Setup Timeout Implementation

- [x] 4.1 Wrap `Location.watchPositionAsync()` call in Phase 3 with `Promise.race()` and 10 second timeout
- [x] 4.2 If Phase 3 setup times out, retry up to 3 times with 5 second delays
- [x] 4.3 Log timeout attempts with format: `[Location] Phase 3 setup timeout, attempt <n>/3`
- [x] 4.4 If all 3 retries exhausted, set atom to `{ status: 'unavailable', coords: null, accuracy: null }`

## 5. Watchdog Mechanism Implementation

- [x] 5.1 Add `lastUpdateRef` using `useRef(Date.now())` to track last successful callback
- [x] 5.2 In Phase 3 watcher callback, update `lastUpdateRef.current = Date.now()`
- [x] 5.3 Add watchdog interval that runs every 15 seconds
- [x] 5.4 In watchdog check, compare current time with `lastUpdateRef.current`
- [x] 5.5 If no updates for 30+ seconds, restart Phase 3 watcher
- [x] 5.6 Log watchdog restart with format: `[Location] Watchdog: restarting watcher after no updates for 30+ seconds`

## 6. Global Initialization Timeout Implementation

- [x] 6.1 Add global initialization timeout of 15 seconds from start of `start()` function
- [x] 6.2 If global timeout is reached before location is ready, set atom to `{ status: 'timeout', coords: null, accuracy: null }`
- [x] 6.3 Continue running Phase 2 and Phase 3 watchers after global timeout
- [x] 6.4 Log global timeout with format: `[Location] Global initialization timeout: proceeding with watchers`
- [x] 6.5 If location fix is obtained after global timeout, update atom to `{ status: 'ready', ... }`

## 7. Status Transition Logging

- [x] 7.1 Add logging function `logStatusChange(oldStatus, newStatus, coords)` for status transitions
- [x] 7.2 Log all status transitions with format: `[Location] Status change: <oldStatus> → <newStatus>`
- [x] 7.3 Include coordinates in log when available: `[Location] Status change: <oldStatus> → <newStatus> @ <lat>, <lon> (accuracy: <acc>m)`

## 8. Invalid Transition Handling

- [x] 8.1 Add validation function `isValidStatusTransition(from, to)` that returns true for valid transitions
- [x] 8.2 Check validity before updating `locationAtom` status
- [x] 8.3 Log invalid transitions: `[Location] Invalid status transition ignored: <from> → <to>`

## 9. Cleanup and Testing

- [x] 9.1 Clear global initialization timeout in cleanup function (when component unmounts)
- [x] 9.2 Clear watchdog interval in cleanup function
- [x] 9.3 Clear Phase 1 timeout reference in cleanup function
- [x] 9.4 Test Phase 1 timeout on iOS simulator with location set to "None"
- [x] 9.5 Test Phase 3 timeout and retry logic
- [x] 9.6 Test watchdog mechanism by simulating no location updates for 30+ seconds
- [x] 9.7 Test global initialization timeout and background watcher continuation
- [x] 9.8 Test status transition logging in development mode
- [x] 9.9 Test invalid status transition handling

## 10. Coarse Location Accuracy (NEW)

- [x] 10.1 Update Phase 2 to use Location.Accuracy.Coarse
- [x] 10.2 Update Phase 3 to use Location.Accuracy.Coarse
- [x] 10.3 Increase distanceInterval for Phase 2 to 500m
- [x] 10.4 Increase distanceInterval for Phase 3 to 1000m
- [x] 10.5 Increase timeInterval for Phase 2 to 120 seconds
- [x] 10.6 Increase timeInterval for Phase 3 to 300 seconds
