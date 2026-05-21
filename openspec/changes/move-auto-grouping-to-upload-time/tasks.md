## 1. Add wave assignment helper to photoUploadService.js

- [x] 1.1 Import `loadActiveWave` from `activeWaveStorage`, `isLocationInWave` and `createWave` from `Waves/reducer` into `photoUploadService.js`
- [x] 1.2 Create `checkAndAssignWave({ lat, lon, uuid })` helper function that: loads active wave via `loadActiveWave()`, calls `isLocationInWave(lat, lon, waveUuid)`, returns `{ waveUuid }` (current or new)
- [x] 1.3 Implement drift branch in `checkAndAssignWave`: when `isLocationInWave` returns false, call `createWave({ name: generateWaveName(lat, lon), uuid, lat, lon })` and return the new wave's UUID
- [x] 1.4 Create `generateWaveName(lat, lon)` utility that formats as `"Lat°N Lon°W - Month Day, Year"` (e.g., "40.71°N 74.01°W - May 21, 2026")
- [x] 1.5 Add error handling: if `isLocationInWave` or `createWave` fails, return `{ waveUuid: null }` and log the error

## 2. Integrate wave assignment into processCompleteUpload

- [x] 2.1 In `processCompleteUpload`, before photo generation, call `checkAndAssignWave({ lat, lon, uuid })` to determine target wave
- [x] 2.2 Store the assigned `waveUuid` on the processed item (same pattern as existing `processedItem.waveUuid`)
- [x] 2.3 After successful upload and `addPhotoToWave`, update active wave atom via `saveActiveWave()` if a new wave was created

## 3. Add flush logic before each upload

- [x] 3.1 Create `flushUngroupedPhotos(uuid)` helper in `photoUploadService.js` that calls `autoGroupPhotos` via GraphQL
- [x] 3.2 In `processCompleteUpload`, call `flushUngroupedPhotos(uuid)` before wave assignment (only if there are pending ungrouped items — check queue first)
- [x] 3.3 Handle flush errors gracefully: log and continue with current photo upload

## 4. Simplify useCameraCapture.js

- [x] 4.1 Remove `driftCheckRef` ref declaration and all drift-check serialization logic
- [x] 4.2 Remove imports of `isLocationInWave`, `autoGroupPhotos` from Waves/reducer (no longer needed in capture)
- [x] 4.3 Simplify `takePhoto()`: when grouping enabled + online, always enqueue without waveUuid; remove the entire drift-check if/else chain (~100 lines)
- [x] 4.4 Keep existing behavior for: grouping disabled (pass through waveUuid), offline (enqueue ungrouped)
- [x] 4.5 Remove `runAutoGroupLoop` helper function from useCameraCapture.js

## 5. Wire up network state in upload service

- [x] 5.1 Ensure `processCompleteUpload` receives or can access the current `netAvailable` state (via parameter)
- [x] 5.2 In `checkAndAssignWave`, skip drift check when offline and return `{ waveUuid: null }`

## 6. Update tests and verify

- [ ] 6.1 Run existing test suite to ensure no regressions
- [ ] 6.2 Test capture flow with grouping enabled/disabled, online/offline
- [ ] 6.3 Test upload flow with active wave (fits), drifted photo (new wave created), no active wave (new wave created)
