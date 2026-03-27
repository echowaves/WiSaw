## 1. Create photoRefreshBus

- [x] 1.1 Create `src/events/photoRefreshBus.js` with `subscribeToPhotoRefresh(listener)` and `emitPhotoRefresh({ photoId })` following the Set-based pattern from `photoDeletionBus.js`

## 2. Photo component integration

- [x] 2.1 Subscribe to `photoRefreshBus` in the Photo component's data-loading useEffect, filtering by `photo?.id` and incrementing `internalRefreshKey` on match; return unsubscribe in cleanup
- [x] 2.2 Emit `emitPhotoRefresh({ photoId })` at the end of the comment deletion handler in Photo component
- [x] 2.3 Remove `global.photoRefreshCallbacks` registration and cleanup from Photo component
- [x] 2.4 Remove the `setInterval(checkForRefresh, 1000)` polling block and `global.lastCommentSubmission` check from Photo component

## 3. ModalInputText integration

- [x] 3.1 Replace `global.photoRefreshCallbacks.get(photoId)()` call with `emitPhotoRefresh({ photoId })` in ModalInputText after comment submission
- [x] 3.2 Remove `global.lastCommentSubmission = Date.now()` fallback from ModalInputText
