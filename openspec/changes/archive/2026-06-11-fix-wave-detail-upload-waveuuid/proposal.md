## Why

Photos captured from a WaveDetail screen are not added to the wave they are captured from, even though the `waveUuid` is available at the footer and passed into the camera capture flow. The result is that users take photos in a wave context but the photos upload without any wave association, requiring manual assignment afterward. This is a one-line bug in `useCameraCapture.js`.

## What Changes

- Add `waveUuid` to the `captureArgs` object in `takePhoto()` so it is passed to `enqueueCapture()`
- This enables the existing upload pipeline to associate the photo with the correct wave via the `addPhotoToWave` mutation

## Capabilities

No spec changes needed — the existing `photo-upload` spec already states the correct behavior. The code was simply not implementing it.

## Impact

**Files modified:**
- `src/screens/PhotosList/hooks/useCameraCapture.js` — Add `waveUuid` to `captureArgs` in `takePhoto()` (1 line addition)

**Files verified no changes needed:**
- `src/screens/PhotosList/components/PhotosListFooter.js` — Already passes `waveUuid` to `onCameraPress`
- `src/screens/PhotosList/upload/usePhotoUploader.js` — Already passes `waveUuid` through `queueFileForUpload`
- `src/screens/PhotosList/upload/photoUploadService.js` — Already calls `addPhotoToWave` when `processedItem.waveUuid` is set
- `src/screens/WaveDetail/index.js` — Already subscribes to upload bus and filters by matching `waveUuid`
- No backend API changes required
