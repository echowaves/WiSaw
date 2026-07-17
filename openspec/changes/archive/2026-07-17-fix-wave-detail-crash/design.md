## Context

`src/screens/WaveDetail/index.js` contains a `useEffect` (lines ~173–201) referencing two `Animated.Value` variables (`pendingPhotosAnimation`, `uploadIconAnimation`) that were never declared. Their UI consumers were removed in a prior refactor, leaving orphaned code that crashes on component mount.

## Goals / Non-Goals

**Goals:**
- Eliminate the `ReferenceError` crash when navigating to wave detail

**Non-Goals:**
- Restoring the animation UI (consumers are gone; no indication they're needed)
- Apollo Client investigation (user confirmed uploads work fine)

## Decisions

- **Delete the entire `useEffect` block** rather than re-declaring the `Animated.Value` refs — the animation values have no JSX consumers, so re-declaring them would just create no-op animations burning CPU.

## Risks / Trade-offs

- **Risk**: If someone intended to restore the animation UI later, removing the effect loses that scaffolding. **Mitigation**: Git history preserves the removed code.
