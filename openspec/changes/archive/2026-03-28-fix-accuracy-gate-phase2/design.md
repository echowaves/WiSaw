## Context

The 3-phase location refinement system was just shipped (`location-refinement-drift-banner`). Phase 1 seeds from `getLastKnownPositionAsync`, Phase 2 refines with `Accuracy.High`, Phase 3 maintains with `Accuracy.Balanced`. An accuracy gate (`storedAccuracyRef`) prevents worse fixes from overwriting better ones. However, the gate is set from the Phase 1 seed, which can have a very good accuracy value from a previous GPS session — blocking all Phase 2 fixes from being accepted.

## Goals / Non-Goals

**Goals:**
- Allow Phase 2 GPS fixes to always overwrite the stale Phase 1 seed
- Preserve Phase 3 accuracy gating to prevent cell/WiFi regression

**Non-Goals:**
- Changing Phase 2/3 watcher configuration
- Changing the atom shape or drift banner logic

## Decisions

### Decision 1: Reset accuracy gate at Phase 2 start

**Choice:** Add `storedAccuracyRef.current = Infinity` as the first line of `startPhase2()`, before the watcher is created.

**Rationale:** Phase 2 uses `Accuracy.High` exclusively — all fixes are GPS-quality. There's no risk of accepting a bad cell-tower fix during Phase 2. The gate's purpose is to prevent regression from `Balanced` (Phase 3) fixes replacing `High` (Phase 2) fixes — which only matters after Phase 2 ends. Resetting to `Infinity` lets all Phase 2 fixes through, and the last one naturally sets the bar for Phase 3.

**Alternatives considered:**
- *Timestamp-aware gating (reject cached fixes older than N minutes)* — more correct theoretically but adds complexity for the same result
- *Don't gate at all during Phase 2* — equivalent to resetting to Infinity, just expressed differently in code. Resetting the ref is simpler (one line, keeps the existing `setLocationReady` logic unchanged).

## Risks / Trade-offs

- **None significant.** Phase 2 is GPS-only, so removing the gate during Phase 2 doesn't risk accepting a bad fix. Phase 3 gating is unchanged.
