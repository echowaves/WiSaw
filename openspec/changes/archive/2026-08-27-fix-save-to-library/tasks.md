## 1. Migrate save call to new API (photo-upload capability)

- [x] 1.1 In `src/hooks/useCameraCapture.js`, replace `import * as MediaLibrary from 'expo-media-library'` with `import { Asset } from 'expo-media-library'` (verify the import is used only for the save call first)
- [x] 1.2 In `takePhoto`, replace `await MediaLibrary.saveToLibraryAsync(cameraReturn.assets[0].uri)` with `await Asset.create(cameraReturn.assets[0].uri)`, keeping the surrounding best-effort `try/catch`, the failure `console.error('[takePhoto] Save to library error:', ...)`, and the success log

## 2. Remove orphaned duplicate hook (photo-upload capability)

- [x] 2.1 Confirm `src/screens/PhotosList/hooks/useCameraCapture.js` has zero importers (grep `src/` and `app/` for the import path)
- [x] 2.2 Delete `src/screens/PhotosList/hooks/useCameraCapture.js` (and the `hooks/` directory if it becomes empty)

## 3. Verification

- [x] 3.1 Capture a photo from the PhotosList camera; confirm a new entry appears in the device photo library AND the photo uploads to the feed
- [x] 3.2 Capture a video (5s) from the camera; confirm the save attempt does not throw a deprecation error (either the video lands in the library, or the failure is logged as a plain save error) and the upload proceeds
- [x] 3.3 Confirm the log no longer contains `Method saveToLibraryAsync imported from "expo-media-library" is deprecated`
- [x] 3.4 Confirm `npx ts-standard` (or the project's lint gate) reports no new errors vs baseline
