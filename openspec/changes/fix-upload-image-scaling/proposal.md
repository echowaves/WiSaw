## Why

When a photo is uploaded and optimistically inserted into the feed, it renders with the wrong aspect ratio (stretched or squished tile). After a full refresh the image displays correctly. This is caused by `ensurePhotoDimensions()` reading dimensions from the compressed local file (resized to height 3000) instead of the original camera file.

## What Changes

- Reorder the `candidateUris` array in `ensurePhotoDimensions()` so `originalCameraUrl` is checked first, before the compressed `localImgUrl`. This ensures the optimistic feed insertion uses the original image dimensions.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `photo-upload`: The `ensurePhotoDimensions` fallback should prefer original camera file dimensions over compressed derivative dimensions.

## Impact

- `src/screens/PhotosList/upload/photoUploadService.js` — one line change to reorder `candidateUris` array in `ensurePhotoDimensions`
- No API changes, no backend changes, no breaking changes
