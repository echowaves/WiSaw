## Why

The app's location initialization is a one-shot per-screen call with no retry. When `getCurrentPositionAsync` fails (GPS cold start, recent airplane mode, buggy device drivers), the location stays `null` forever — the photo feed is empty, the footer is hidden, and the user must restart the app. Location also doesn't update as the user moves, so the geo feed goes stale. Moving location to a global Jotai atom with `watchPositionAsync` solves all three issues: resilient startup, ongoing updates, and shared state across screens.

## What Changes

- Add a `locationAtom` to `src/state.js` with three states: `pending`, `denied`, `ready`
- Create `src/hooks/useLocationProvider.js` — a hook that requests permission, fast-seeds with `getLastKnownPositionAsync`, starts `watchPositionAsync`, and retries watcher startup on failure (max 3 attempts)
- Call `useLocationProvider()` from `app/_layout.tsx` so location initializes at app startup
- Migrate `PhotosList` to read `locationAtom` instead of calling `useLocationInit`
- Migrate `WaveDetail` to read `locationAtom` instead of calling `useLocationInit`
- Change `PhotosListFooter` to always render but disable camera/video buttons when location is not ready
- Add a "Obtaining your location..." banner to `PhotosList` when location status is `pending`
- Show a location-specific empty state card when feed can't load due to pending/denied location
- Show a "Location access needed" banner with Settings link when status is `denied`
- Delete `useLocationInit.js` after migration is complete

## Capabilities

### New Capabilities
- `location-provider`: Global location provider hook and atom — permission request, fast-seed, `watchPositionAsync` with retry, three-state atom (`pending`/`denied`/`ready`)

### Modified Capabilities
- `location-services`: Location initialization moves from per-screen one-shot to global watcher with retry; permission denied and GPS pending are distinct states
- `photo-feed`: Feed shows location-specific empty state and "Obtaining location" banner while location is pending; feed auto-loads when location becomes ready
- `photo-upload`: Camera/video buttons are visible but disabled (not hidden) when location is not ready; WaveDetail reads shared atom instead of own hook
- `wave-detail`: WaveDetail reads locationAtom for camera gating; wave browsing works normally without location

## Impact

- New file: `src/hooks/useLocationProvider.js`
- Modified: `src/state.js` — add `locationAtom`
- Modified: `app/_layout.tsx` — call `useLocationProvider()`
- Modified: `src/screens/PhotosList/index.js` — read atom, add pending/denied UI
- Modified: `src/screens/PhotosList/components/PhotosListFooter.js` — always render, disable buttons
- Modified: `src/screens/WaveDetail/index.js` — read atom, drop `initLocation`
- Modified: `src/screens/PhotosList/hooks/useCameraCapture.js` — check atom status
- Deleted: `src/screens/PhotosList/hooks/useLocationInit.js`
- No new dependencies — `expo-location` and `jotai` already in project
