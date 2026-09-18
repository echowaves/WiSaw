## Context

See proposal.md for motivation. Current state that shapes the design:

- `src/hooks/useLocationProvider.js` runs a single `useEffect` (deps `[setLocation]`) that does: `resolvePermission()` → Phase 1 fast-seed → `await startPhase2()` → Phase 3. All lifecycle (timers, watcher subscription, `permUnknown` flag) lives in effect-local variables; cleanup removes the watcher, clears the two timers, and removes the AppState listener.
- `locationAtom` (`src/state.js`) already declares `lastUpdate` and `initStage` fields that nothing writes, and `PhotosList` already renders an `unavailable` branch — but never a `timeout` branch (a `timeout` status would render an empty white screen today).
- `PhotosList` has an effect `if (locationState.status === 'ready') reload()` — a `timeout`/`unavailable` → `ready` transition will auto-reload the feed for free.
- Verified against `expo-location@57.0.11` native sources: `getLastKnownPositionAsync` is a synchronous cache read (iOS `LocationModule.swift`, Android `LocationModule.kt:204`); `watchPositionImplAsync` resolves on registration (iOS streams in a detached `Task`; Android settles via `onRequestSuccess`/`onRequestFailed` in `LocationHelpers.kt:89`). Watcher *errors* are emitted as `Expo.locationError` events that are only delivered if the JS call passed an `errorHandler` — WiSaw currently passes none, so failures are dropped.
- Constraint (project rule): max cyclomatic complexity 8 per function → the hook's logic must be split into small helpers.

## Goals / Non-Goals

**Goals:**
- No user-visible "stuck on obtaining location" state that requires an app restart to clear.
- Reuse the already-specified `timeout`/`unavailable` statuses and the already-rendered `unavailable` UI; make them reachable.
- Keep the 3-phase architecture and the accuracy gate untouched.

**Non-Goals:**
- No background location (no `startLocationUpdatesAsync` task) — foreground-only stays.
- No changes to watcher parameters (Coarse/500/120s, Coarse/1000/300s) — they stay as-is.
- No new dependencies; no backend changes.
- Not changing what "Phase 2" means (it stays the 60s refinement window).

## Decisions

### D1 — Single init "generation" token instead of scattered booleans

The effect-local state (`cancelled`, `phase2Transitioned`, `permUnknown`, new watchdog/timeout flags) is about to grow. Wrap the whole init lifecycle in one `let generation = 0` counter: `checkAndStart()` captures `const gen = ++generation`; every async continuation and every timer callback bails if `gen !== generation`. Re-init (foreground re-entry, watchdog give-up) bumps the counter, which atomically invalidates stale callbacks from the previous run without a tangle of per-concern flags.

**Alternative considered:** keep adding booleans (`watchdogArmed`, `rechecking`, …). Rejected — the existing code already shows the drift (e.g. `permUnknown` declared after its use site, which works only because of function scoping); a token is one mechanism instead of five.

### D2 — Watchdog keyed on "watcher registered at time T, no fix yet", not "last fix at time T"

The June spec's watchdog (restart if no *update* for 30s) is incompatible with the June watcher params (Phase 3 = 1000 m distance / 300 s time interval): a stationary user produces zero callbacks, so that watchdog would restart the watcher every 30–45s forever. The watchdog here is armed only while `status !== 'ready'` **and the Phase 3 watcher is active**, keyed on `watcherRegisteredAt`, and disarms permanently on the first accepted fix. Phase 2 is excluded on purpose: the existing `location-initialization-timing` spec requires the watchdog not to apply during Phase 2, and Phase 2's own 60s timeout guarantees a transition to Phase 3, so no fix-less state can persist there.

**Alternative considered:** the June "no updates for 30s" form. Rejected — permanent false-positive restarts for stationary users; it also never fires for the actual bug (no fix ever arrives, so "last update" is meaningless).

### D3 — Watcher restart = remove + re-register *in place*

A watchdog restart removes `watcherRef.current` and re-registers the **Phase 3** watcher via a shared `registerWatcher(phase)` helper, resetting `watcherRegisteredAt`. The `location-initialization-timing` spec's "Watchdog does not trigger during Phase 2" is honored literally: the watchdog's interval and the watcher error handler both no-op while `activePhase !== 'phase3'`. Phase 2's own 60s timeout always transitions to Phase 3, so a permanently stuck Phase 2 cannot outlast ~60s + the Phase 3 window — no watchdog coverage of Phase 2 is needed. No full `checkAndStart()` re-run: that would re-request permission (native prompt risk) and re-seed.

**Alternative considered:** restart via a full re-init. Rejected — permission re-prompt and Phase 1 re-seed are unnecessary and add user-visible churn.

### D4 — `errorHandler` funnels into the watchdog budget

`watchPositionAsync(options, cb, (reason) => onWatcherError(reason))`. `onWatcherError` while `status !== 'ready'` → treat as a no-fix failure: restart immediately (counts against the 3-attempt budget, resets `watcherRegisteredAt`). While `ready` → dev log only. This makes OS "location unavailable" failures surface within seconds instead of the full 30s window, and stops the silent-drop problem at its root.

**Alternative considered:** a separate retry counter for errors. Rejected — one bounded budget is easier to reason about and the failure modes are the same (no usable fix).

### D5 — Global 15s timeout writes `timeout`, never cancels anything

`setTimeout` at `checkAndStart()` start (post-permission). On fire: if `status` is still `pending`, write `{ status: 'timeout', coords: null, accuracy: null }`; watchers and watchdog keep running; a later fix writes `ready` (the accuracy gate is untouched, so this works through the existing `setLocationReady`). The timeout is cleared on fix and on unmount. The `timeout` write goes through the same status-transition validation as all other writes (see D7).

**Alternative considered:** fold `timeout` into `unavailable` (one status). Rejected — they have different UI and different recovery expectations (`timeout`: keep waiting, no action needed; `unavailable`: show card + settings action). The spec already distinguishes them and the UI half exists for both.

### D6 — `unknown` permission: keep the AppState re-check AND add a 15s repeating timer

The Sep 12 audit fix made `unknown` block init with an AppState-`active`-only re-check, which never fires if the app stays foregrounded. Add a repeating 15s timer (started when `unknown` is observed, cleared on definitive status or unmount) that re-runs `resolvePermission()`. On `granted` → proceed to fast-seed/Phase 2; on `denied` → existing denied path; on `unknown` again → keep the timer.

**Alternative considered:** longer interval (30/60s). Rejected — Mac Catalyst hang is the only realistic `unknown` case and it's not user-fixable; 15s keeps recovery snappy if the bridge call ever resolves.

### D7 — Status writes go through one `transition(status, payload)` helper with a validation map

All atom writes move through a single helper that (a) checks the transition against the allowed map from the `location-status-transitions` spec, (b) writes `lastUpdate: Date.now()` alongside, and (c) emits the spec'd dev logs (`[Location] Status change: …`, `[Location] Invalid status transition ignored: …`). This makes the "Invalid Transition Handling" and "Status Transition Logging" requirements (spec'd 2026-06-19, also never implemented) real with ~20 lines.

Allowed map (from spec): `pending → ready|denied|timeout|unavailable`; `ready → denied|unavailable`; `timeout → ready|denied|unavailable`; `unavailable → ready|denied`; `denied → ready` (permission re-granted via foreground re-init path). Same-status writes (e.g. another `ready` fix) are allowed as no-op status changes.

**Alternative considered:** validate inside `setLocationReady` only. Rejected — `denied`/`timeout`/`unavailable` writes bypass that function today; one choke point is required for the spec's "SHALL" on *all* transitions.

### D8 — Foreground re-init covers `timeout`, `unavailable`, and `denied`

Extend the existing AppState listener: on `active`, if status is `timeout`, `unavailable`, or `denied` → bump generation, reset watchdog budget, run `checkAndStart()`. If `ready` → do nothing (existing behavior).

**Why include `denied`:** the primary denial-recovery flow is "user denies → opens Settings from the alert/card → enables location → backgrounds the app → returns." Without a `denied` re-check on foreground, that flow dead-ends and the user must restart the app — the exact symptom this change removes. `requestForegroundPermissionsAsync` is a non-prompting re-check on iOS/Android once permission has been decided, so the denial Alert only re-shows if the user *still* has it denied (acceptable: it offers Open Settings again, no prompt is shown).

### D9 — PhotosList `timeout` branch reuses the pending visuals with distinct copy

In the `!location` gate: treat `timeout` like `pending` for the banner (same banner bar, copy "Still finding your location...") and render the `EmptyStateCard` with the same `location-on` icon, title "Finding Your Location", and a subtitle that location is taking longer and photos will appear automatically. No buttons — the provider recovers on its own (D5/D8). The existing `unavailable` branch gains `actionText='Open Settings'` / `onActionPress={() => Linking.openSettings()}` on its card (the component already supports actions — see the denied card).

**Alternative considered:** new dedicated component for timeout. Rejected — the state is transient and visual identity with `pending` is the point (same spinner-of-hope, slightly different copy).

## Risks / Trade-offs

- **[Watchdog restarts a watcher that is merely slow]** → bounded (3 attempts, 30s windows), only while no fix has ever arrived; a 90s-slow-but-healthy GPS would trigger 2–3 restarts before giving up — acceptable trade, and the foreground re-init (D8) recovers without restart.
- **[Generation token invalidates a legitimate in-flight Phase 2 await]** → re-init only fires from user-visible foregrounding or give-up; the new generation re-runs the full sequence, so the "lost" await is replaced, not orphaned.
- **[`transition()` rejects a legitimate write due to a missing edge in the map]** → dev log makes it loud in dev; the map is the spec's table verbatim, and same-status writes are allowed, so the realistic failure (extra `ready` fix) is a no-op, not a rejection.
- **[PhotosList `timeout` branch renders but the provider never recovers and never reaches `unavailable`]** → cannot happen: watchdog budget exhaustion (3 × 30s + restarts ≈ 2 min after timeout) always lands on `unavailable`.
- **[Re-check timer on Mac Catalyst spins every 15s forever while hung]** → two 5s bridge calls per tick, no UI impact; matches the Sep 12 audit's intent (never assume granted).
- **[Spec drift in the other direction]** → this change also rewrites the drifted watcher-parameter and "Phase 2 timeout 30s" text in `location-provider` to match code (Coarse/500/120s, Coarse/1000/300s, 60s).

## Migration Plan

Single frontend change, no backend, no data migration:

1. Implement `useLocationProvider.js` changes (D1, D2, D3, D4, D5, D6, D7, D8) in one commit-friendly unit; the hook is self-contained.
2. Implement `PhotosList` UI branch (D9).
3. Manual QA matrix (dev build): (a) normal cold start → fix < 30s, zero watchdog restarts in log; (b) airplane-mode/GPS-off start → `timeout` at 15s, `unavailable` by ~2 min, card shows, Open Settings works, re-enabling + foregrounding recovers to `ready` without restart; (c) deny permission → alert + denied card unchanged; (d) background 5 min, foreground → no watcher churn when `ready`.
4. Rollback: revert the two files; no state-shape or API coupling.

## Open Questions

- None blocking. (The "should `unavailable` keep a slow background watcher forever" question from exploration was resolved by the spec's own recovery path — foreground re-init (D8) — which is simpler than a permanent background watcher and matches the June design's "SHALL NOT attempt to restart watchers" wording after give-up.)
