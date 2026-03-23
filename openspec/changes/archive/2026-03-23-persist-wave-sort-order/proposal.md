## Why

The wave list screen does not recognize the user's sort order preference on initial landing. Sort state is held in React `useState` with hardcoded defaults (`updatedAt`/`desc`), so every app restart or full screen remount resets it. Users who prefer a non-default sort must change it every time they visit the Waves screen.

## What Changes

- Add `waveSortBy` and `waveSortDirection` jotai atoms to global state
- Add SecureStore persistence for wave sort preferences (save/load with timeout protection) following the existing `waveStorage.js` pattern
- Hydrate wave sort atoms on app startup in `_layout.tsx` alongside existing `Promise.allSettled` chain
- Replace local `useState` sort management in the Waves screen with `useAtom`; save to SecureStore on sort change
- Consolidate duplicate data-fetching effects in `WavesHub` into a single `useFocusEffect` with correct dependencies, eliminating stale closure risk and double-fetch potential

## Capabilities

### New Capabilities
- `wave-sort-persistence`: Persist and restore the user's wave list sort preference across app restarts using jotai atoms and SecureStore

### Modified Capabilities

## Impact

- `src/state.js` — 2 new atom exports
- `src/utils/waveStorage.js` — 2 new functions (save/load sort preferences)
- `app/_layout.tsx` — import new loader, add to hydration `Promise.allSettled`, set atoms
- `app/(drawer)/waves/index.tsx` — swap `useState` for `useAtom`, save on sort change
- `src/screens/WavesHub/index.js` — remove `useEffect` for sort, fix `useFocusEffect` dependencies
- No new dependencies, no API changes, no breaking changes
