## 1. Location Atom & Utility

- [x] 1.1 Add `accuracy: null` to `locationAtom` initial value in `src/state.js`
- [x] 1.2 Create `src/utils/haversine.js` with pure haversine function returning distance in meters

## 2. Location Provider 3-Phase Refinement

- [x] 2.1 Refactor `useLocationProvider` to store accuracy in atom and only accept equal-or-better accuracy fixes via `setLocationReady`
- [x] 2.2 Implement Phase 2 refinement watcher (`Accuracy.High`, `distanceInterval: 0`, `timeInterval: 1000`) with 30s timeout and 50m accuracy exit condition
- [x] 2.3 Implement Phase 2 → Phase 3 transition: remove Phase 2 watcher, start Phase 3 maintenance watcher (`Accuracy.Balanced`, `distanceInterval: 100`, `timeInterval: 60000`) with same accuracy-gating
- [x] 2.4 Ensure cleanup on unmount removes whichever watcher is active (Phase 2 or Phase 3) and clears the Phase 2 timeout

## 3. Feed Location Snapshot & Drift Detection

- [x] 3.1 Add `feedLocationRef` to PhotosList and update `reload()` to snapshot current `locationAtom.coords` into the ref
- [x] 3.2 Replace the auto-reload `useEffect` (fires on `coords?.latitude, coords?.longitude`) with a status-only effect that fires on `locationState.status` transition to `'ready'`
- [x] 3.3 Compute drift via haversine between `feedLocationRef` and live `locationAtom.coords`, derive `showDriftBanner` boolean (drift > 500m, segment 0 only, feedLocationRef not null)

## 4. Location Drift Banner UI

- [x] 4.1 Create `src/screens/PhotosList/components/LocationDriftBanner.js` component styled like `PendingPhotosBanner` (themed card, icon, text, tappable)
- [x] 4.2 Render `LocationDriftBanner` in PhotosList between header and content, passing `reload` as the tap handler, only when `showDriftBanner` is true
