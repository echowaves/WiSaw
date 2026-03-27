## 1. Upload Event Bus

- [x] 1.1 Create `src/events/uploadBus.js` with `subscribeToUploadComplete(listener)` and `emitUploadComplete({ photo, waveUuid })` following the existing Set-based listener pattern

## 2. Upload Context & Provider

- [x] 2.1 Create `src/contexts/UploadContext.js` exporting the React context with default value `{ enqueueCapture: () => {}, pendingPhotos: [], isUploading: false, clearPendingQueue: () => {} }`
- [x] 2.2 Create `UploadProvider` component in the same file that: reads `uuid`/`setUuid` from `STATE.uuid`, manages `netAvailable` via NetInfo listener, derives `topOffset` from safe area insets, instantiates `usePhotoUploader`, and provides context value
- [x] 2.3 Wrap Drawer children with `<UploadProvider>` in `app/(drawer)/_layout.tsx`

## 3. Modify usePhotoUploader to Emit to Bus

- [x] 3.1 In `usePhotoUploader.js`, replace `onPhotoUploaded(uploadedPhoto)` call with `emitUploadComplete({ photo: uploadedPhoto, waveUuid: currentItem.waveUuid })`
- [x] 3.2 Remove the `onPhotoUploaded` parameter from the hook's destructured options

## 4. Migrate PhotosList to Upload Context + Bus

- [x] 4.1 In `PhotosList/index.js`, replace `usePhotoUploader` instantiation with `useContext(UploadContext)` to get `enqueueCapture`, `pendingPhotos`, `isUploading`, `clearPendingQueue`
- [x] 4.2 Replace `handleUploadSuccess` callback with a `useEffect` subscribing to `subscribeToUploadComplete`, prepending all received photos via `createFrozenPhoto` with deduplication
- [x] 4.3 Remove `handleUploadSuccess` callback and the `refreshPendingQueue`/`processPendingQueue` destructuring that are no longer needed

## 5. Migrate WaveDetail to Upload Context + Bus

- [x] 5.1 In `WaveDetail/index.js`, replace `usePhotoUploader` instantiation with `useContext(UploadContext)` to get `enqueueCapture`, `pendingPhotos`, `isUploading`, `clearPendingQueue`
- [x] 5.2 Replace `handleUploadSuccess` callback with a `useEffect` subscribing to `subscribeToUploadComplete`, filtering by `waveUuid` match before prepending
- [x] 5.3 Remove `handleUploadSuccess` callback and unused uploader-related imports

## 6. Cleanup

- [x] 6.1 Verify no remaining direct imports of `usePhotoUploader` from screen files (only `UploadProvider` should import it)
- [x] 6.2 Verify `usePhotoUploader` no longer references `onPhotoUploaded` anywhere
