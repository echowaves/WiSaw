## 1. WavesHub - Restore Badge Subscriptions

- [x] 1.1 Add `subscribeToUploadComplete` import to `src/screens/WavesHub/index.js`
- [x] 1.2 Add `subscribeToAutoGroupDone` import to `src/screens/WavesHub/index.js`
- [x] 1.3 Add `getUngroupedPhotosCount` import to `src/screens/WavesHub/index.js`
- [x] 1.4 Add `getWavesCount` import to `src/screens/WavesHub/index.js`
- [x] 1.5 Add `subscribeToAutoGroupDone(() => fetchCounts())` listener in WavesHub useEffect
- [x] 1.6 Add `subscribeToUploadComplete(() => fetchCounts())` listener in WavesHub useEffect

## 2. UngroupedPhotosCard - Restore Auto-Group Listener

- [x] 2.1 Add `subscribeToAutoGroupDone` import to `src/components/UngroupedPhotosCard/index.js`
- [x] 2.2 Add `requestUngroupedPhotos` import to `src/components/UngroupedPhotosCard/index.js`
- [x] 2.3 Add `subscribeToAutoGroupDone()` listener in UngroupedPhotosCard useEffect
- [x] 2.4 In listener, set `fetchedRef.current = false` to allow re-fetching
- [x] 2.5 In listener, call `batchRef.current = Crypto.randomUUID()` and `requestUngroupedPhotos` to fetch fresh photos

## 3. Verification

- [x] 3.1 Run `npm run lint` to verify no lint errors
- [ ] 3.2 Test upload flow: upload photo → verify badge updates automatically (no manual refresh)
- [ ] 3.3 Test auto-group flow: trigger auto-group → verify badge updates automatically
- [ ] 3.4 Test thumbnails: trigger auto-group → verify thumbnails show in UngroupedPhotosCard (no empty placeholders)
- [ ] 3.5 Test waves list: trigger auto-group → verify waves appear without manual pull-to-refresh
