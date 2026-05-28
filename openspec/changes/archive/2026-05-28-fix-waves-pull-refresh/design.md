## Context

The WavesHub screen (`src/screens/WavesHub/index.js`) has two user-initiated refresh paths:
1. **Focus refresh** — `useFocusEffect` fires when the screen gains focus (e.g., returning from wave detail)
2. **Pull-to-refresh** — `handleRefresh` fires when the user pulls down on the FlatList

Both call `loadWaves(0, newBatch, true)` to reset pagination and re-fetch page 0. However, `handleRefresh` is missing three state resets that `useFocusEffect` performs:
- `loadingRef.current = false` — allows refresh to proceed even if a prior fetch is in-flight
- `setNoMoreData(false)` — clears stale pagination flag
- `fetchCounts()` — updates ungrouped photo count and wave count

This means pull-to-refresh can silently do nothing (loading guard blocks it) and never updates the badge counts.

## Goals / Non-Goals

**Goals:**
- Align `handleRefresh` behavior with `useFocusEffect` so both produce identical results
- Fix the silent-skip bug when a prior fetch is in-flight
- Ensure badge counts update on pull-to-refresh

**Non-Goals:**
- No changes to the GraphQL queries or Apollo cache configuration
- No changes to the `loadWaves` function itself
- No changes to the debounced search behavior
- No changes to the focus-refresh logic

## Decisions

**Decision: Inline the three missing lines in `handleRefresh`**
- Rationale: Minimal diff, zero new abstractions. The two functions (`useFocusEffect` callback and `handleRefresh`) are already nearly identical — just align them.
- Alternatives considered:
  - Extract a shared `doFullRefresh` helper — adds indirection for a 3-line fix, and both callers already have slightly different needs (`handleRefresh` sets `refreshing` state, `useFocusEffect` doesn't).
  - Use `useRef` for the refresh logic — over-engineering for two call sites.

**Decision: No spec file creation**
- Rationale: The existing `wave-hub` spec already describes focus-refresh behavior. The delta modifies the existing "Waves List Focus Refresh" requirement to also cover pull-to-refresh. No new capability is introduced.

## Risks / Trade-offs

**[Risk] None** — This is a 3-line fix with no architectural changes. The behavior being added already exists in `useFocusEffect` and is tested by existing scenarios.
