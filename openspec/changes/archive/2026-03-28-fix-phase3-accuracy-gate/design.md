## Context

The 3-phase location refinement system in `useLocationProvider` uses a `storedAccuracyRef` gate to prevent regressions — a fix with worse accuracy than the current stored value is silently discarded. When Phase 2 starts, this gate is reset to `Infinity` (allowing all fixes through). But when Phase 2 transitions to Phase 3, the gate retains the Phase 2 GPS accuracy (e.g. 15m). Phase 3 runs `Accuracy.Balanced` (~100m), so every Phase 3 fix is rejected. Position is frozen forever after Phase 2.

## Goals / Non-Goals

**Goals:**
- Phase 3 maintenance watcher updates the atom when the user moves, enabling drift detection
- `__DEV__`-only logging to diagnose location issues on-device

**Non-Goals:**
- Changing the 3-phase architecture or phase durations
- User-visible accuracy indicators
- Changing the drift banner threshold or behavior

## Decisions

### Decision 1: Reset accuracy gate at Phase 3 transition

**Choice:** Add `storedAccuracyRef.current = Infinity` inside `transitionToPhase3()`, before calling `startPhase3()`.

**Why:** Same pattern as the Phase 2 reset. Each phase operates in its own accuracy tier — Phase 2 gates within GPS-quality fixes, Phase 3 gates within Balanced-quality fixes. The gate prevents regression *within* a phase, not *across* phases.

**Alternative:** Remove the accuracy gate entirely. Rejected — it serves a useful purpose within each phase (preventing oscillation between better and worse fixes of the same tier).

### Decision 2: Add `__DEV__` logging

**Choice:** Add `console.log` calls at Phase 1 seed, Phase 2 start/callbacks, Phase 2→3 transition, and Phase 3 start/callbacks. Each log includes accuracy and coords. All gated behind `__DEV__` so they're stripped from production builds.

**Why:** The last two bugs in the location system were diagnosed entirely through code reading. On-device logs in Metro would have surfaced them in minutes.

## Risks / Trade-offs

- **[Accuracy regression within Phase 3]** → Mitigated: the gate still works within Phase 3's Balanced tier. A 100m fix won't be replaced by a 500m fix.
- **[Console noise in dev]** → Mitigated: `__DEV__` gate, Phase 3 fires at most once per 100m movement with 60s interval.
