## 1. Active Wave Storage & State

- [x] 1.1 Create `src/utils/activeWaveStorage.js` with `saveActiveWave({ waveUuid, name })`, `loadActiveWave()`, and `clearActiveWave()` functions using AsyncStorage key `@activeWave`
- [x] 1.2 Create `activeWaveAtom` in `src/state.js` as `atom(null)` with shape `{ waveUuid: string, name: string } | null`
- [x] 1.3 Create `hydrateActiveWaveAtom()` in `src/utils/activeWaveStorage.js` that reads from AsyncStorage and returns the parsed value or `null`
- [x] 1.4 Call `hydrateActiveWaveAtom()` during app startup in `app/_layout.tsx` and initialize the atom

## 2. isLocationInWave GraphQL Query

- [x] 2.1 Add `isLocationInWave({ lat, lon, waveUuid, uuid })` query function to `src/screens/Waves/reducer.js` using the `isLocationInWave(lat: Float!, lon: Float!, waveUuid: String!, uuid: String!): Boolean!` GraphQL query
- [x] 2.2 Add `isActive` field to the `listWaves` query selection set in `src/screens/Waves/reducer.js`

## 3. Active Wave Sync from listWaves

- [x] 3.1 In `src/screens/WavesHub/index.js`, after `listWaves` returns, scan results for `isActive: true` and update `activeWaveAtom` + persist via `saveActiveWave()`
- [x] 3.2 When a wave is deleted in WavesHub and it matches the current `activeWaveAtom.waveUuid`, call `clearActiveWave()` and set `activeWaveAtom` to `null`

## 4. Auto-Group Active Wave Update

- [x] 4.1 Add `isNewWave` to the `autoGroupPhotosIntoWaves` mutation selection set in `src/screens/Waves/reducer.js`
- [x] 4.2 In the `handleAutoGroup` function in `src/screens/WavesHub/index.js`, after the auto-group loop completes, if the final response has `isNewWave: true`, update `activeWaveAtom` with `{ waveUuid, name }` and call `saveActiveWave()`

## 5. Pre-Upload Drift Check in useCameraCapture

- [x] 5.1 Add a processing lock ref (`driftCheckRef`) to `useCameraCapture` to serialize concurrent drift-check operations
- [x] 5.2 In `useCameraCapture.takePhoto()`, when `grouping.enabled` is `true` and a `checkWaveUuid` is available (either from the screen's `waveUuid` prop or `activeWaveAtom`), call `isLocationInWave(lat, lon, checkWaveUuid, uuid)` before calling `enqueueCapture`
- [x] 5.3 If `isLocationInWave` returns `true`: pass `checkWaveUuid` as `waveUuid` to `enqueueCapture`
- [x] 5.4 If `isLocationInWave` returns `false` (drift detected): call `autoGroupPhotosIntoWaves` to flush old ungrouped photos, then call `enqueueCapture` without `waveUuid`, then call `autoGroupPhotosIntoWaves` again to create new wave from the uploaded photo
- [x] 5.5 If `activeWaveAtom` is `null` (no active wave): call `enqueueCapture` without `waveUuid`, then call `autoGroupPhotosIntoWaves` immediately
- [x] 5.6 If offline (no network): skip the `isLocationInWave` check, enqueue without `waveUuid`
- [x] 5.7 If `grouping.enabled` is `false`: pass through the `waveUuid` from the caller unchanged (preserve current behavior)

## 6. Drift Toast Notifications

- [x] 6.1 After the drift-check flow creates a new wave (`isNewWave: true`), show toast: "Moved to new location — wave '<name>' created"
- [x] 6.2 When a wave detail capture is redirected to the ungrouped path due to drift, show toast explaining the photo was not added to the viewed wave

## 7. Fix grouping.enabled Guard

- [x] 7.1 In `src/hooks/useLocationDrift.js`, add a check for `grouping.enabled` — return `shouldTrigger: false` when `enabled` is `false`
- [x] 7.2 In `src/screens/WavesHub/index.js` auto-trigger effect, add `grouping.enabled` guard as defense in depth

## 8. Wave Detail Camera Boundary Check

- [x] 8.1 In `src/screens/WaveDetail/index.js` camera flow, the `waveUuid` passed to `useCameraCapture` remains the viewed wave's UUID — the drift check in `useCameraCapture` (task 5.2) handles boundary checking and will drop/redirect if the photo doesn't fit
