## Why

The accuracy-gating logic in `useLocationProvider` prevents Phase 3 (maintenance watcher) from ever updating the location atom after Phase 2 succeeds. Phase 2 stores a GPS-quality accuracy value (e.g. 15m), and Phase 3 runs with `Accuracy.Balanced` which produces fixes at ~100m. The gate rejects every Phase 3 fix because `100 > 15`. The result: after the initial 30-second refinement window, the user's position is frozen forever — even if they travel to another city.

## What Changes

- Reset `storedAccuracyRef` to `Infinity` when transitioning from Phase 2 to Phase 3, so Phase 3 fixes are accepted immediately and the gate works correctly within the Balanced-accuracy tier
- Add `console.log` instrumentation to each phase transition and watcher callback during development, gated behind `__DEV__`, to enable diagnosis of location issues on-device

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `location-provider`: Phase 3 transition SHALL reset the accuracy gate so Balanced-accuracy fixes are accepted after Phase 2 completes

## Impact

- **Files modified**: `src/hooks/useLocationProvider.js` (accuracy gate reset + dev logging)
- **Risk**: Low — single-line gate reset mirrors the existing Phase 2 reset pattern; dev logs are `__DEV__`-only
