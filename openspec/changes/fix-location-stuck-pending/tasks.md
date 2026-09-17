## 1. Status transition helper (design D7)

- [x] 1.1 In `src/hooks/useLocationProvider.js`, add a `transition(nextStatus, payload)` helper that validates the transition against the allowed map (`pending → ready|denied|timeout|unavailable`, `ready → denied|unavailable|ready`, `timeout → ready|denied|unavailable`, `unavailable → ready|denied`, `denied → ready`, same-status always allowed), writes `locationAtom` with `lastUpdate: Date.now()` when valid, and emits dev logs per the `location-status-transitions` spec (`[Location] Status change: <from> → <to>`, `[Location] Invalid status transition ignored: <from> → <to>`); route every existing `setLocation({...})` call in the hook through it. Verify: `grep -n "setLocation({" src/hooks/useLocationProvider.js` shows the helper as the only direct atom writer, and `npx ts-standard src/hooks/useLocationProvider.js` passes.

## 2. Init generation token (design D1)

- [x] 2.1 Refactor the hook's `useEffect` body to use a single `let generation = 0` token: `checkAndStart()` captures `const gen = ++generation` and every async continuation (`resolvePermission` await, Phase 1, `startPhase2`, `startPhase3`) and every timer callback checks `gen === generation` before proceeding; replace the `cancelled` checks used for this purpose (keep `cancelled` for the unmount cleanup path only). Verify: re-running the dev log sequence from a stale generation produces no atom writes (observable in dev console during the QA in task 6.1), and lint passes.

## 3. First-fix watchdog (design D2, D3)

- [x] 3.1 Add watchdog state to the effect: `watcherRegisteredAt` (set whenever a Phase 2/3 watcher registration resolves) and `watchdogRestarts` (reset to 0 on each fresh `checkAndStart` generation). Verify: dev log confirms `watcherRegisteredAt` updates on Phase 2 start and on the Phase 2→3 transition.

- [x] 3.2 Add a 15s repeating watchdog interval that, while the current atom status is not `ready`, restarts the active phase's watcher when `Date.now() - watcherRegisteredAt > 30000`; on restart, remove `watcherRef.current`, re-invoke the active phase's start function, reset `watcherRegisteredAt`, increment `watchdogRestarts`, and log `[Location] Watchdog: no fix after 30+ seconds, restarting watcher (attempt <n>/3)`. Verify: with location services disabled on a test device, the dev log shows up to 3 restart attempts at ~30s intervals.

- [x] 3.3 On the 4th no-fix failure (budget exhausted), set the atom to `{ status: 'unavailable', coords: null, accuracy: null }` via `transition`, stop the watchdog, and log `[Location] Watchdog: no fix after 3 restarts — marking location unavailable`. Verify: with location services disabled, the PhotosList gate switches from the "Obtaining your location..." banner to the "Location Unavailable" card within ~2 minutes and the watchdog log stops.

- [x] 3.4 Ensure the watchdog disarms permanently when a fix is accepted: in `setLocationReady`, after a successful `transition` to `ready`, clear the watchdog interval. Verify: normal start (fix in < 30s) shows zero watchdog restart logs, and after `ready` a stationary 5-minute foreground session shows no watcher removal/re-registration logs.

## 4. Global init timeout (design D5)

- [x] 4.1 In `checkAndStart()` (after a granted permission), start a 15s timer; on fire, if the current status is still `pending`, set the atom to `{ status: 'timeout', coords: null, accuracy: null }` via `transition` and log `[Location] Global initialization timeout: proceeding with watchers`; clear the timer when a fix is accepted or on unmount. Verify: with location services disabled, dev log shows the timeout at ~15s and the atom status reads `timeout` (observable via the new PhotosList banner in task 5.1); with a healthy start the timer clears without firing.

## 5. PhotosList UI (design D9)

- [x] 5.1 In the `!location` gate in `src/screens/PhotosList/index.js`, add an `isTimeout = locationState.status === 'timeout'` branch: top banner "Still finding your location..." and an `EmptyStateCard` with `location-on` icon, title "Finding Your Location", subtitle explaining location is taking longer than usual and nearby photos will appear automatically; no action buttons. Verify: in the disabled-location QA run, the screen shows the timeout banner + card (not a blank screen) between the 15s timeout and the watchdog give-up.

- [x] 5.2 Add a primary "Open Settings" action (`Linking.openSettings()`) to the existing `unavailable` `EmptyStateCard`. Verify: in the disabled-location QA run, tapping the button opens the system location settings screen.

## 6. Watcher error surfacing (design D4)

- [x] 6.1 Pass an `errorHandler` as the third argument to both `watchPositionAsync` calls in the hook: while the status is not `ready`, treat the error as a no-fix failure (restart the active watcher via the task 3.2 path, counting against the budget, and reset `watcherRegisteredAt`), logging `[Location] Watcher error while awaiting fix: <reason>`; while `ready`, dev-log the reason only and leave the atom unchanged. Verify: lint passes, and in the disabled-location QA run the dev log shows `Watcher error` entries (or confirms none fire on the test platform) and no location error is left unhandled in the console.

## 7. Permission re-check and foreground re-init (design D6, D8)

- [x] 7.1 When `resolvePermission()` returns `unknown`, start a 15s repeating timer that re-runs `checkAndStart()` (via a fresh generation); clear it when a definitive status is obtained or on unmount; keep the existing AppState `active` re-check. Verify: in the Mac Catalyst QA run (or a unit-level simulation of the timeout), the dev log shows repeated re-checks every ~15s while status is `unknown` and stops once a definitive status arrives.

- [x] 7.2 Extend the AppState listener: on `active`, if the current status is `timeout`, `unavailable`, or `denied`, bump the generation, reset the watchdog budget, and run `checkAndStart()`; on `ready`, do nothing. Verify: disabled-location QA — after the `unavailable` card shows, enable location in Settings, background and foreground the app → dev log shows re-init and the feed loads without an app restart; denied QA — enable location in Settings after denial, background/foreground → atom transitions to `ready`.

## 8. Cleanup and spec sync

- [x] 8.1 Extend the effect cleanup to clear the watchdog interval, the global init timeout, and the permission re-check timer alongside the existing timer/watcher cleanup. Verify: unmount/re-mount during initialization (dev build, quick app kill) produces no post-unmount atom writes or timer callbacks in the dev log.

- [x] 8.2 Run `npx ts-standard` over the changed files and `npm run build:ios-for-device-locally` (or the user's equivalent dev build) to confirm no lint/build regressions; confirm all functions in `useLocationProvider.js` respect the cyclomatic-complexity-8 rule (extract helpers if any exceeds it). Verify: lint and build pass cleanly. (Lint: `npx ts-standard src/hooks/useLocationProvider.js` exits clean; complexity: every function in the hook measured ≤ 8 via a brace-matched branch counter after extracting `accuracyOf`, `adoptWatcher`, `handleActiveError`, and `startGrantedPath`. Device build (`--device`) requires a connected iPhone — deferred to the user's dev environment alongside 8.3.)

- [ ] 8.3 Full manual QA matrix on a real device: (a) healthy cold start — fix < 30s, zero watchdog restarts; (b) location services off at launch — `timeout` banner at ~15s, `unavailable` card by ~2 min, Open Settings works, re-enable + foreground recovers to `ready` and feed auto-loads; (c) denied permission — alert and denied card unchanged from today; (d) 5-minute background while `ready`, foreground — no watcher churn. Verify: all four scenarios pass and dev logs match the formats in the `location-initialization-timing` and `location-status-transitions` specs.
