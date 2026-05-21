## Why

Currently, auto-grouping decisions (whether a photo fits the current wave or needs a new one) are made at capture time in `useCameraCapture.js`. This requires complex drift-check logic during photo taking, and when drift is detected, the photo must be enqueued as "ungrouped" followed by an additional `autoGroupPhotos` call to create the new wave — resulting in multiple server round-trips. Moving this decision to upload time simplifies capture logic significantly and ensures photos are always assigned to the correct wave on first upload.

## What Changes

- **Move drift detection from capture-time to upload-time**: Remove ~100 lines of `isLocationInWave` + auto-group loop logic from `useCameraCapture.js`. Capture now simply enqueues photos without a `waveUuid` when grouping is enabled.
- **Add wave assignment at upload time in `photoUploadService.js`**: Before uploading each photo, load the current active wave via `loadActiveWave()`, call `isLocationInWave(lat, lon, waveUuid)` to check if it fits, and either assign to the current wave or create a new one.
- **New wave naming convention**: When drift is detected and a new wave must be created, name it using format `"Downtown - May 21, 2026"` (location-based + date).
- **Flush ungrouped photos before upload**: Before processing each photo for upload, flush any pending ungrouped photos via `autoGroupLoop` to ensure uploads start from a clean state.
- **Drift check happens when network is available and photo is ready**: The drift check moves into the upload pipeline (`processCompleteUpload`) where it runs once the photo has been processed locally and network connectivity is confirmed.

## Capabilities

### New Capabilities
- `upload-wave-assignment`: Wave assignment logic that runs during photo upload — loads active wave, checks location drift via `isLocationInWave`, assigns to current wave or creates new wave with auto-generated name.

### Modified Capabilities
- `photo-wave-assignment`: Requirement changes — wave assignment now happens at upload time instead of capture time; photos are always assigned a wave on first upload (no "ungrouped" state for uploaded photos).
- `upload-drift-check`: Drift check moves from capture-time to upload-time; runs when network is available and photo is ready.

## Impact

**Files modified:**
- `src/screens/PhotosList/hooks/useCameraCapture.js` — Remove drift-check logic (~100 lines), simplify `takePhoto()` to always enqueue without waveUuid when grouping enabled
- `src/screens/PhotosList/upload/photoUploadService.js` — Add `checkAndAssignWave()` helper; import `loadActiveWave`, `isLocationInWave`, `createWave`; integrate into `processCompleteUpload`
- `src/screens/PhotosList/upload/usePhotoUploader.js` — Minor: ensure location data is passed through to upload service

**New files:**
- None (logic moves, not added)

**API changes:**
- No new server endpoints needed; reuses existing `isLocationInWave`, `createWave`, and `autoGroupPhotos` mutations.
