## 1. Location Atom and Provider Hook

- [x] 1.1 Add `locationAtom` to `src/state.js` with initial value `{ status: 'pending', coords: null }`
- [x] 1.2 Create `src/hooks/useLocationProvider.js` — request permission, fast-seed with `getLastKnownPositionAsync`, start `watchPositionAsync` (Balanced accuracy, 100m distance, 60s interval), retry watcher startup on failure (max 3, 5s delay), set atom to `denied`/`ready` accordingly, cleanup watcher on unmount
- [x] 1.3 Call `useLocationProvider()` from `app/_layout.tsx` inside the root layout component

## 2. Migrate PhotosList to Location Atom

- [x] 2.1 Replace `useLocationInit` usage in `src/screens/PhotosList/index.js` with `useAtom(STATE.locationAtom)` — remove `initLocation` call, derive `location` coords from atom, keep `reload()` triggered on atom coords change
- [x] 2.2 Add pending/denied UI to PhotosList — show "Obtaining your location..." banner when `status === 'pending'`, show "Location access needed" banner with Settings link when `status === 'denied'`, show location-specific empty state card for both states
- [x] 2.3 Update `PhotosListFooter` (`src/screens/PhotosList/components/PhotosListFooter.js`) — remove `if (!location) return null` guard, always render footer, disable camera/video buttons with opacity 0.4 when location status is not `ready`

## 3. Migrate WaveDetail to Location Atom

- [x] 3.1 Replace `useLocationInit` usage in `src/screens/WaveDetail/index.js` with `useAtom(STATE.locationAtom)` — remove `initLocation` call and `useEffect` for location init, derive coords from atom for camera capture, ensure wave browsing works regardless of location state
- [x] 3.2 Update WaveDetail's `PhotosListFooter` usage — pass location status so camera/video buttons are disabled when location not ready

## 4. Migrate Camera Capture Hook

- [x] 4.1 Update `src/screens/PhotosList/hooks/useCameraCapture.js` — read location from `locationAtom` via `useAtom` instead of receiving it as a parameter, check `status === 'ready'` before permitting capture

## 5. Cleanup

- [x] 5.1 Delete `src/screens/PhotosList/hooks/useLocationInit.js` and remove all remaining imports/references to it
