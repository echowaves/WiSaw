## 1. Remove local queue check from flushUngroupedPhotos

- [x] 1.1 Remove the `readQueue()` call, `hasUngrouped` check, and early return from `flushUngroupedPhotos` in `src/screens/PhotosList/upload/photoUploadService.js`
- [x] 1.2 Remove the `readQueue` import if it becomes unused

## 2. Verify

- [x] 2.1 Verify the app has no errors after the change
