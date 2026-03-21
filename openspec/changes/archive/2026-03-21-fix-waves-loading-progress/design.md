## Context

The `unified-loading-progress` change correctly identified that WavesHub and WaveDetail needed `LinearProgress` bars. However, the Waves screen implementation targeted `src/screens/Waves/index.js` instead of `src/screens/WavesHub/index.js`. The route file `app/(drawer)/waves/index.tsx` imports and renders `WavesHub`, making `Waves` unreachable from the route.

## Goals / Non-Goals

**Goals:**
- Add `LinearProgress` to `WavesHub` (the actually-rendered component) matching the PhotosList pattern
- Delete the dead `Waves` component (`src/screens/Waves/index.js`) — it is never rendered by any route and is obsolete code. The reducer (`Waves/reducer.js`) is kept since WavesHub re-exports from it.

**Non-Goals:**
- Changing the progress bar pattern itself

## Decisions

### Decision 1: Move LinearProgress from Waves to WavesHub

The fix is to add the same `LinearProgress` pattern (3px bar, `CONST.MAIN_COLOR`, `theme.HEADER_BACKGROUND`) to WavesHub and remove it from Waves. The bar goes between the search bar and the FlatList in WavesHub's render.

**Why:** WavesHub is the component the route renders. Waves is not used by the route.

### Decision 2: Delete Waves/index.js entirely

The `Waves` component is dead code — no route renders it. It was a more ambitious gesture-based wave manager that was developed but never shipped. Deleting it reduces confusion. The reducer at `Waves/reducer.js` stays because WavesHub re-exports from it.

## Risks / Trade-offs

- [Risk: Losing the gesture-based wave manager code] → It was never shipped and can be recovered from git history if needed.
