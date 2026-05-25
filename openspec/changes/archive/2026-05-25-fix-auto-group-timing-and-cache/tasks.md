## 1. Fix auto-group timing

- [x] 1.1 Remove the `flushUngroupedPhotos` call from `processCompleteUpload` in `src/screens/PhotosList/upload/photoUploadService.js`
- [x] 1.2 Add a post-drain flush in `usePhotoUploader.processQueue` — after the queue drains successfully (`remainingQueue.length === 0`), wait 5 seconds then call `flushUngroupedPhotos`; skip if grouping is disabled
- [x] 1.3 Import `flushUngroupedPhotos` and `_groupingState` in `usePhotoUploader.js`

## 2. Fix Apollo caching

- [x] 2.1 Add `fetchPolicy: 'network-only'` to the `listWaves` query in `src/screens/Waves/reducer.js`
- [x] 2.2 Add `fetchPolicy: 'network-only'` to the `getUngroupedPhotosCount` query in `src/screens/Waves/reducer.js`
- [x] 2.3 Add `fetchPolicy: 'network-only'` to the `getWavesCount` query in `src/screens/Waves/reducer.js`

## 3. Verify

- [x] 3.1 Verify no remaining references to `flushUngroupedPhotos` in `processCompleteUpload`
- [x] 3.2 Verify the app builds without errors
