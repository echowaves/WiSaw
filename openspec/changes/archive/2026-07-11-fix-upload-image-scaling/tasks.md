## 1. Fix ensurePhotoDimensions candidate order

- [x] 1.1 Reorder `candidateUris` in `ensurePhotoDimensions` (`src/screens/PhotosList/upload/photoUploadService.js`) so `originalCameraUrl` is checked first, before `localImgUrl` and `localThumbUrl`

## 2. Verify

- [x] 2.1 Test that newly uploaded photos render with correct aspect ratio in the feed without requiring a refresh
