## Why

The accuracy-gating logic in `useLocationProvider` prevents Phase 2 (GPS refinement) from ever updating the location when `getLastKnownPositionAsync` returns a cached fix with good accuracy from a previous session. The cached fix may be from hours/days ago at a different physical location, but its accuracy value (e.g. 10m) blocks all fresh GPS fixes (which start at 50-100m while warming up). The result: the app permanently shows photos from where the user *was*, not where they *are*.

## What Changes

- **Reset accuracy gate at Phase 2 start**: Set `storedAccuracyRef = Infinity` when Phase 2 begins so all fresh GPS fixes are accepted during refinement, regardless of the cached seed's accuracy value.
- The accuracy gate remains active in Phase 3 (maintenance) to prevent cell/WiFi regression after GPS convergence.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `location-provider`: The Phase 2 refinement watcher SHALL reset the accuracy gate before starting, so fresh GPS fixes always replace the stale seed position.

## Impact

- **Files modified**: `src/hooks/useLocationProvider.js` (one line added)
- **Risk**: None — Phase 3 gating is unchanged, so cell/WiFi regression is still prevented after GPS converges.
