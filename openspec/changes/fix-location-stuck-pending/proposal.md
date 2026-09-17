## Why

Intermittently, on app launch WiSaw gets stuck on "Obtaining your location..." indefinitely and only recovers after a restart. Investigation of `expo-location@57.0.11` native sources shows the watcher *registrations* resolve quickly, but nothing detects the case where a watcher is registered and never delivers a fix (cold GPS after phone reboot, wedged CoreLocation/FusedLocation service, OS-reported location failure). `locationAtom` stays `pending` forever: there is no global init timeout, no "no fix" watchdog, and `watchPositionAsync` is called without the `errorHandler` argument, so OS location errors are silently dropped. The June 19 `location-initialization-fix` change spec'd exactly these protections (and marked them done) but shipped none of them — and its premise (that `getLastKnownPositionAsync` hangs) was wrong; that call is a synchronous cache read that cannot hang. The `timeout`/`unavailable` UI half already exists in `PhotosList` but no code can ever set those statuses.

## What Changes

- Add a **global initialization timeout** (~15s from init start): if no fix yet, flip atom to `status: 'timeout'`; watchers keep running and a late fix transitions to `ready`.
- Add a **first-fix watchdog**: while no fix has been received, if a registered watcher delivers nothing for 30s, restart it; after 3 restart attempts, flip atom to `status: 'unavailable'` and stop retrying. Once a fix is received the watchdog disarms (maintenance mode — a stationary user legitimately gets no updates).
- Pass an **`errorHandler`** to both `watchPositionAsync` calls so CoreLocation/FusedLocation failure events are no longer dropped; an error while still without a fix counts as a watchdog failure (restart, then `unavailable`).
- Make the **`unknown` permission re-check time-based** (re-check every ~15s while unknown) in addition to the existing AppState `active` re-check, so a launch-and-stay-foregrounded app recovers without user action.
- **Foreground re-init**: when AppState transitions to `active` and status is `timeout` or `unavailable`, re-run the permission check + init (e.g., after the user enables location in Settings). This is what removes the "restart the app" workaround.
- **UI**: render a `timeout` status branch in the PhotosList gate (banner + empty-state card indicating location is still being found in the background — today a `timeout` status would render an empty white screen); add an "Open Settings" action to the existing `unavailable` empty-state card.
- **Spec drift fix**: `location-provider` spec still describes Phase 2 as `Accuracy.High, distanceInterval 0, timeInterval 1000` and Phase 3 as `Balanced, 100m, 60s`; code uses `Coarse, 500m, 120s` and `Coarse, 1000m, 300s` since June.

## Capabilities

### New Capabilities

(none — all behavior belongs to existing capabilities)

### Modified Capabilities

- `location-provider`: watcher lifecycle gains first-fix watchdog with bounded restart + `unavailable` give-up, `errorHandler` wiring, time-based `unknown`-permission re-check, and foreground re-init on `timeout`/`unavailable`; watcher parameter requirements corrected to match code.
- `location-initialization-timing`: Phase 1 `getLastKnownPositionAsync` timeout requirement removed (verified non-hang: synchronous cache read); Phase 3 *setup* timeout requirement replaced by the first-fix watchdog (registration resolves immediately; the failure is the absence of fixes); watchdog semantics corrected (applies only while awaiting the first fix, not after every 30s gap in maintenance mode, which is incompatible with the June Coarse/1000m/300s Phase 3 params); global 15s init timeout requirement kept and now actually implemented.
- `location-status-transitions`: `unavailable` semantics changed — the provider MAY resume on the next foreground transition (currently "SHALL NOT attempt to restart watchers"); `timeout` → `unavailable` escalation confirmed as the watchdog give-up path.
- `photo-feed`: new scenario for `status: 'timeout'` UI (still-looking-for-location banner + card); `unavailable` card gains an "Open Settings" action.

## Impact

- `src/hooks/useLocationProvider.js` — watchdog, global timeout, errorHandler, re-check timers, foreground re-init.
- `src/screens/PhotosList/index.js` — `timeout` status branch; `unavailable` card action.
- No new dependencies, no API/backend changes, no state-shape change (`timeout`/`unavailable`/`lastUpdate`/`initStage` already declared in `locationAtom`; the hook will start writing `lastUpdate`).
- Specs: 4 delta specs (`location-provider`, `location-initialization-timing`, `location-status-transitions`, `photo-feed`).
- Risk: watchdog restarts a watcher on devices where CoreLocation is briefly slow — bounded (3 attempts) and only while no fix has ever arrived, so no impact on normal fast-fix starts.
