## Why

Three bugs degrade the auto-grouping and waves experience: (1) the grouping `enabled` toggle is persisted to AsyncStorage but the Jotai atom is never hydrated with the stored value — so after app restart, grouping always appears enabled regardless of what the user chose; (2) when grouping is disabled, the capture flow still passes `waveUuid` to uploads instead of uploading as ungrouped; (3) the waves list `useFocusEffect` wraps its callback in `useCallback` with stable deps, so revisiting the screen doesn't re-fire the data fetch, causing stale wave names/counts.

## What Changes

- **Fix grouping atom hydration**: Set `groupingAtom` from the hydrated AsyncStorage values during app startup in `_layout.tsx`, so all components see the persisted `enabled` state immediately
- **Fix grouping-disabled capture path**: When `grouping.enabled` is `false`, always upload photos as ungrouped (drop `waveUuid`) — no wave checks, no drift checks, no auto-group calls
- **Fix waves list refresh**: Remove `useCallback` wrapping inside `useFocusEffect` so the data-fetch runs on every focus event, not only when deps change

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `auto-group-trigger`: The `grouping.enabled` toggle persistence is broken — the atom must be properly hydrated from AsyncStorage at app startup so the persisted state is respected
- `wave-hub`: The focus-refresh must fire on every screen visit, not only when callback deps change
- `upload-wave-assignment`: When grouping is disabled, photos SHALL always be uploaded as ungrouped regardless of screen context (no `waveUuid` pass-through)

## Impact

- **State**: `groupingAtom` in `src/utils/groupingAtom.js` — hydration path needs to actually update the atom, not just a module variable
- **App startup**: `app/_layout.tsx` — must call `useSetAtom(groupingAtom)` with hydrated values
- **Capture flow**: `src/screens/PhotosList/hooks/useCameraCapture.js` — grouping-disabled branch drops `waveUuid`
- **Waves screen**: `src/screens/WavesHub/index.js` — `useFocusEffect` callback structure
- **No new dependencies**
