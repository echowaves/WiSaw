## 1. Auto-group completion triggers full reload

- [x] 1.1 In `src/screens/WavesHub/index.js`, change `subscribeToAutoGroupDone` callback from `fetchCounts()` to `handleRefresh()`

## 2. Photo upload completion triggers full reload

- [x] 2.1 In `src/screens/WavesHub/index.js`, change `subscribeToUploadComplete` callback from `fetchCounts()` to `handleRefresh()` for both waveUuid != null and waveUuid == null cases (remove the conditional guard)
- [x] 2.2 Update the `useEffect` dependency array from `[fetchCounts]` to `[handleRefresh]`

## 3. Verification

- [x] 3.1 Test: navigate to WavesHub, trigger auto-group, verify waves list reloads with fresh data after completion
- [x] 3.2 Test: upload a photo to a wave from WaveDetail, return to WavesHub, verify wave thumbnail updated
- [x] 3.3 Test: upload an ungrouped photo, verify ungrouped count and list reload
- [x] 3.4 Test: rapid sequential uploads do not cause duplicate concurrent fetches (loading guard works)
