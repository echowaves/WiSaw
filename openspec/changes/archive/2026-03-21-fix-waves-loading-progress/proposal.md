## Why

The `unified-loading-progress` change added a `LinearProgress` bar to `src/screens/Waves/index.js`, but the route file `app/(drawer)/waves/index.tsx` actually renders `WavesHub` from `src/screens/WavesHub/index.js`. The `LinearProgress` was added to the wrong component, so the waves list still has no loading indicator.

## What Changes

- Add `LinearProgress` bar to `src/screens/WavesHub/index.js` (the component actually rendered by the route)
- Delete `src/screens/Waves/index.js` — dead code, never rendered by any route. The reducer (`src/screens/Waves/reducer.js`) is kept since WavesHub re-exports from it.

## Capabilities

### New Capabilities
_(none)_

### Modified Capabilities
- `wave-hub`: The loading progress bar requirement applies to WavesHub, not Waves

## Impact

- `src/screens/WavesHub/index.js` — add `LinearProgress` import and JSX
- `src/screens/Waves/index.js` — remove `LinearProgress` import and JSX (cleanup)
