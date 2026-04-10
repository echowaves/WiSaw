## Why

The WaveDetail screen receives `isFrozen` and `myRole` as static navigation params set at push time. When a user navigates to WaveSettings and changes the freeze/unfreeze state (or any other wave property), returning to WaveDetail shows stale state — the frozen banner, header snowflake, and edit restrictions don't reflect the current wave status.

## What Changes

- The `[waveUuid].tsx` route screen will own `isFrozen` and `myRole` as local state, initialized from route params for instant first render
- On every screen focus (via `useFocusEffect`), call `getWave()` to re-fetch current wave metadata and update `isFrozen` and `myRole`
- The header (snowflake icon, role badge) and WaveDetail component reactively update from live state instead of static route params

## Capabilities

### New Capabilities

- `wave-detail-state-refresh`: Re-fetch wave metadata (`isFrozen`, `myRole`) on screen focus so the WaveDetail screen always reflects current backend state after returning from settings or other screens

### Modified Capabilities

(none)

## Impact

- **Route screen** (`app/(drawer)/waves/[waveUuid].tsx`): Adds `useState`, `useFocusEffect`, and `getWave` import; state-driven header and props instead of static route params
- **No changes to WaveDetail component** (`src/screens/WaveDetail/index.js`): Already receives `isFrozen` and `myRole` as props
- **No changes to WaveSettings**: Already uses `getWave` for loading and `updateWave` for saving
- **No new dependencies**: `useFocusEffect` (expo-router) and `getWave` (waves reducer) are already used elsewhere in the codebase
