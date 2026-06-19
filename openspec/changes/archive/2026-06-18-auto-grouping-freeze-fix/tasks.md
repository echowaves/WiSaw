## 1. Frontend - WavesHub (src/screens/WavesHub/index.js)

- [x] 1.1 Remove duplicate emitAutoGroupDone() call - remove the emitAutoGroupDone() call from the try block, keep only in finally block
- [x] 1.2 Replace handleRefresh() with lightweight badge update in subscribeToAutoGroupDone - change listener to call getUngroupedPhotosCount() instead of handleRefresh()
- [x] 1.3 Add optional debounced waves refresh - after lightweight update, optionally schedule handleRefresh() with 500ms debounce

## 2. Frontend - Photo Upload Service (src/screens/PhotosList/upload/photoUploadService.js)

- [x] 2.1 Add concurrency guard to flushUngroupedPhotos() - check autoGroupRunningRef before calling autoGroupPhotos()
- [x] 2.2 Import autoGroupRunningRef from WavesHub or create shared guard - ensure consistent concurrency control

## 3. Backend - Auto Group Photos (lambda-fns/controllers/waves/autoGroupPhotosIntoWaves.ts)

- [x] 3.1 Wrap main logic in try-catch-finally block - ensure pg_advisory_unlock is called in finally block
- [x] 3.2 Test error path - verify lock is released even if error occurs

## 4. Testing

- [x] 4.1 Test manual auto-group - verify no duplicate events and no UI freeze
- [x] 4.2 Test automatic auto-group after upload - verify badge updates correctly
- [x] 4.3 Test concurrent auto-group scenarios - verify guard prevents conflicts
- [x] 4.4 Test backend error handling - verify lock released on error
