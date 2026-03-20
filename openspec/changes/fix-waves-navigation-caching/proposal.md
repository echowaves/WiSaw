## Why

Back navigation from Wave Detail is broken — pressing back (both custom header button and system gesture) navigates all the way to the home screen (PhotosList) instead of returning to the Waves list. Additionally, Wave Detail suffers from a caching bug: navigating to Wave B after viewing Wave A still shows Wave A's photos until a manual refresh.

Both bugs stem from the same root cause: wave screens (`waves`, `wave-detail`, `photo-selection`) are registered as flat Drawer siblings rather than nested inside a Stack navigator. The existing `(tabs)` group correctly uses a nested Stack for its detail screens — waves should follow the same pattern.

## What Changes

- **Restructure wave routes into a nested Stack group**: Move `waves.tsx`, `wave-detail.tsx`, and `photo-selection.tsx` from flat Drawer screens into an `app/(drawer)/waves/` directory with its own `_layout.tsx` Stack navigator
- **Convert `wave-detail` to a dynamic route**: Replace static `wave-detail.tsx` with `[waveUuid].tsx` so each wave gets a unique route segment, guaranteeing a fresh component instance per wave (eliminates caching bug)
- **Remove `waves-hub.tsx`**: Delete dead code — it's a hidden duplicate of `waves.tsx`
- **Remove hidden Drawer.Screen entries**: Remove `waves-hub`, `wave-detail`, and `photo-selection` from the Drawer layout since they move into the waves Stack
- **Update navigation calls**: Change `router.push('/wave-detail', { waveUuid })` to `router.push('/waves/<waveUuid>')` throughout WavesHub and WaveDetail components
- **Fix initial load dependency**: Add `waveUuid` to the `useEffect` dependency array in WaveDetail for correctness

## Capabilities

### New Capabilities
- `waves-navigation`: Stack-based navigation architecture for the waves feature, defining route structure, back-navigation behavior, and screen lifecycle guarantees

### Modified Capabilities
- `wave-detail`: Route params change from search params (`useLocalSearchParams`) to dynamic route segment (`[waveUuid]`), and the screen is now guaranteed to remount per unique wave

## Impact

- **Routes**: `app/(drawer)/waves.tsx` → `app/(drawer)/waves/index.tsx`; `app/(drawer)/wave-detail.tsx` → `app/(drawer)/waves/[waveUuid].tsx`; `app/(drawer)/photo-selection.tsx` → `app/(drawer)/waves/photo-selection.tsx`
- **Deleted files**: `app/(drawer)/waves-hub.tsx` (dead code)
- **Drawer layout**: `app/(drawer)/_layout.tsx` loses three hidden `Drawer.Screen` entries; `waves` screen entry now points to the `waves/` directory group
- **Component changes**: `src/screens/WavesHub/index.js` (navigation call update), `src/screens/WaveDetail/index.js` (param extraction + useEffect dependency fix)
- **No API changes**: GraphQL operations, state atoms, and event buses remain unchanged
- **No dependency changes**: Uses existing Expo Router Stack navigator
