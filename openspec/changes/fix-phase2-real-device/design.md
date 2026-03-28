## Context

Phase 2 of the 3-phase location refinement system starts a `watchPositionAsync` watcher with `Accuracy.High` (`kCLLocationAccuracyNearestTenMeters` on iOS). When a fix arrives with accuracy ≤ 50m, `transitionToPhase3()` is called to switch to the battery-friendly Balanced watcher. A 30-second timeout also calls `transitionToPhase3()` as a hard cap. Two bugs exist: (1) `transitionToPhase3()` has no re-entrancy guard, so two rapid sub-50m callbacks can both trigger it, removing the Phase 3 watcher the first call just started. (2) On a real device with cold GPS, the first fix can take 30-60+ seconds — the 30s timeout fires first, killing Phase 2 before GPS ever delivers a callback.

## Goals / Non-Goals

**Goals:**
- Phase 2→3 transition fires exactly once, regardless of callback timing
- Real-device cold GPS starts have enough time to acquire satellites and deliver at least one fix

**Non-Goals:**
- Changing the 3-phase architecture
- Adaptive timeout based on environment detection
- Handling "Precise Location" toggle (iOS 14+ separate permission)

## Decisions

### Decision 1: Boolean guard for `transitionToPhase3()`

**Choice:** Add a `let phase2Transitioned = false` flag inside `startPhase2()`. Check and set it at the top of `transitionToPhase3()` — if already true, return immediately.

**Why:** Simple, local, zero overhead. The flag lives inside the `startPhase2` closure so it's naturally scoped and garbage-collected.

**Alternative:** Use `watcherRef.current === null` as a guard. Rejected — there's a window between removing the Phase 2 watcher and assigning the Phase 3 watcher where the ref is null for both, making it an unreliable signal.

### Decision 2: Increase `REFINE_TIMEOUT_MS` to 60 seconds

**Choice:** Change the constant from `30000` to `60000`.

**Why:** GPS cold start (Time to First Fix) on real iOS hardware ranges from 15-60+ seconds depending on environment: ~15s outdoors with clear sky, 30-45s urban, 60s+ indoors. The current 30s timeout is only sufficient for the best case. 60s covers most real-world scenarios while keeping battery impact minimal (one-time cost at app launch).

**Alternative:** 90 seconds. Rejected — diminishing returns; if GPS hasn't delivered in 60s, it's likely a signal-blocked environment and Phase 3 Balanced will still provide a reasonable fix.

## Risks / Trade-offs

- **[Longer battery drain during refinement]** → Mitigated: one-time cost at app launch, and the early-exit at ≤ 50m accuracy still applies. Most fixes arrive well before 60s.
- **[Guard doesn't cover edge case where effect cleanup runs during transition]** → Mitigated: `cancelled` flag already handles cleanup; the guard only prevents double-transition within a single mount cycle.
