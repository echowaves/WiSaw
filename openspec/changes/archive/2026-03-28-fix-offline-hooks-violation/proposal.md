## Why

The app crashes on startup when there is no network connection (airplane mode). The `PhotosList` component has two React hooks (`useCallback`, `useMemo`) placed **after** a conditional early return (`if (!netAvailable)`), violating React's Rules of Hooks. When the network state transitions to unavailable, fewer hooks are called than the previous render, causing a fatal error.

## What Changes

- Move `useCallback(removePhoto)` and `useMemo(photosListContextValue)` above the `if (!netAvailable)` early return in `PhotosList` so all hooks execute unconditionally on every render.

## Capabilities

### New Capabilities

_None_

### Modified Capabilities

- `photo-feed`: Hook call order must be unconditional — no hooks after early returns.

## Impact

- `src/screens/PhotosList/index.js`: Reorder two hook declarations (no logic change).
