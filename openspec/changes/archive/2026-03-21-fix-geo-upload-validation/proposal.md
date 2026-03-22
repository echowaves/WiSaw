## Why

Photos are being uploaded without valid geo coordinates due to three failure paths: (1) the initial location state is `{ coords: { latitude: 0, longitude: 0 } }` which is truthy, so the `if (!location)` guard passes and the camera button is available before real GPS coordinates arrive; (2) WaveDetail passes `location: null` when enqueuing captures, causing crashes or silent failures; (3) there is no validation anywhere in the pipeline — neither at capture time nor at upload time — to reject invalid coordinates before they reach the `createPhoto` GraphQL mutation.

## What Changes

- Change location initial state from `{ coords: { latitude: 0, longitude: 0 } }` to `null` in `useLocationInit`, so the existing `if (!location)` guard correctly blocks the camera until real coordinates are available
- Add an `isValidLocation` utility function to validate location objects have non-zero coordinates
- Add validation in `useCameraCapture` to reject photo captures when location is invalid
- Add validation in `processCompleteUpload` as a last line of defense before the `generatePhoto` mutation
- Fix WaveDetail to obtain real location via `useLocationInit` before allowing photo captures

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `location-services`: Add requirement that location MUST be validated before any photo capture or upload is permitted
- `photo-upload`: Add requirement that uploads MUST be rejected if geo coordinates are missing or invalid (0,0)

## Impact

- **Code**: `src/screens/PhotosList/hooks/useLocationInit.js`, `src/screens/PhotosList/hooks/useCameraCapture.js`, `src/screens/PhotosList/upload/photoUploadService.js`, `src/screens/WaveDetail/index.js`
- **New utility**: `src/utils/isValidLocation.js`
- **UX**: Users who tap the camera before GPS lock will see a "Waiting for location..." toast instead of silently uploading to (0,0). WaveDetail users will now have proper location handling.
- **Dependencies**: None
