## Context

`showDriftBanner` is a `useMemo` that compares `feedLocationRef.current` (a ref snapshot of where the feed was last loaded) against `locationState.coords` (live GPS). When `reload()` runs, it updates the ref to match live coords, making drift ≈ 0m. But because the ref mutation doesn't change any useMemo dependency, the memo returns its cached `true` and the banner persists.

## Goals / Non-Goals

**Goals:**
- Make the drift banner reliably dismiss when tapped (or on any `reload()` call)
- Preserve the existing ref-based snapshot pattern (no extra re-renders from location objects in state)

**Non-Goals:**
- Changing the 500m drift threshold
- Adding a manual close/dismiss button (tap-to-reload is the intended UX)
- Refactoring feedLocationRef to state (would cause unnecessary re-renders with location objects)

## Decisions

**Add a `feedLocationVersion` counter** — A simple `useState(0)` that increments in `reload()` alongside the ref snapshot. This counter is added to useMemo's dependency array, forcing recalculation after every reload. The haversine then sees `feedLocationRef.current ≈ locationState.coords` → drift < 500m → banner hides.

Alternative considered: replacing `feedLocationRef` with `useState`. Rejected because storing full location objects in state causes extra re-renders every time the snapshot changes, while the counter approach adds exactly one lightweight state update alongside the existing ref mutation.

## Risks / Trade-offs

- **Risk**: None meaningful — a counter increment is negligible overhead and the useMemo recalculation (one haversine call) is microseconds.
