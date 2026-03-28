## Why

Phase 2 GPS refinement fails on real iOS devices due to two bugs: (1) a race condition where rapid sub-50m callbacks trigger `transitionToPhase3()` multiple times, potentially removing the Phase 3 watcher and orphaning state, and (2) the 30-second Phase 2 timeout is too short for cold GPS starts on real hardware — the GPS radio can take 30-60+ seconds to acquire satellites indoors, meaning the timeout fires before any Phase 2 callback arrives, and the position remains at the stale Phase 1 cached fix.

## What Changes

- Guard `transitionToPhase3()` against re-entrant calls so it can only execute once
- Increase `REFINE_TIMEOUT_MS` from 30 seconds to 60 seconds to accommodate cold GPS starts on real devices

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `location-provider`: Phase 2 transition guard against double-fire and increased timeout for real-device GPS cold starts

## Impact

- **Files modified**: `src/hooks/useLocationProvider.js` (transition guard + timeout constant)
- **Risk**: Low — guard is a simple boolean flag, timeout increase is conservative and only affects battery during the one-time refinement window
