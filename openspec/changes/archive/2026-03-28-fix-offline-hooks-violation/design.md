## Context

`PhotosList` (`src/screens/PhotosList/index.js`) has an early return when `netAvailable` is `false` that renders an offline empty-state UI. Two hooks — `useCallback(removePhoto)` and `useMemo(photosListContextValue)` — are declared **after** this early return. When the network becomes unavailable, React sees fewer hooks than the previous render and throws a fatal "Rendered fewer hooks than expected" error, crashing the app.

## Goals / Non-Goals

**Goals:**
- Eliminate the Rules of Hooks violation so the app renders the offline UI without crashing.

**Non-Goals:**
- Changing offline behavior or adding offline capabilities.
- Refactoring the component structure.

## Decisions

**Hoist hooks above the conditional return.**
Move `useCallback(removePhoto)` and `useMemo(photosListContextValue)` above the `if (!netAvailable)` block. Neither hook depends on `netAvailable`; they only reference `setPhotosList`. This is the minimal, zero-risk change.

*Alternative considered:* Wrap the entire render in a single return with conditional content. Rejected — larger diff with no benefit for a two-line reorder.

## Risks / Trade-offs

- [Minimal risk] The hoisted hooks will execute on offline renders where their values are unused. → No measurable cost — `useCallback` and `useMemo` with stable deps are essentially no-ops.
