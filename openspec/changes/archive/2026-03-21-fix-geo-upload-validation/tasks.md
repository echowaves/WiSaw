## 1. Create isValidLocation utility

- [x] 1.1 Create `src/utils/isValidLocation.js` that exports a function checking `loc?.coords?.latitude` and `loc?.coords?.longitude` are truthy numbers (rejects null, undefined, 0, NaN)

## 2. Fix initial location state

- [x] 2.1 In `src/screens/PhotosList/hooks/useLocationInit.js`, change `useState({ coords: { latitude: 0, longitude: 0 } })` to `useState(null)` so the existing `if (!location)` guard blocks the camera until real coordinates arrive

## 3. Add capture-time validation

- [x] 3.1 In `src/screens/PhotosList/hooks/useCameraCapture.js`, import `isValidLocation` and add a guard before `enqueueCapture` call — if location is invalid, show a "Waiting for location..." toast and return without enqueuing

## 4. Add upload-time validation

- [x] 4.1 In `src/screens/PhotosList/upload/photoUploadService.js`, import `isValidLocation` and add a guard in `processCompleteUpload` before the `generatePhoto` call — if `processedItem.location` is invalid, remove item from queue, show error toast, and return null

## 5. Fix WaveDetail location handling

- [x] 5.1 In `src/screens/WaveDetail/index.js`, import and use `useLocationInit` to obtain real device coordinates, call `initLocation()` on mount, and pass real location to `enqueueCapture` instead of `null`

## 6. Verify

- [x] 6.1 Run Codacy analysis on all modified files
