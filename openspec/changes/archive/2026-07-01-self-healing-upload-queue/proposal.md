## Why

Users report that the upload queue gets stuck — items sit in the queue indefinitely without uploading, and the generic "N photos uploading" indicator provides no insight into whether those items are photos or videos. The queue lacks error resilience: a single failed item blocks the entire queue from making further progress, and internal processing locks can deadlock permanently, leaving the queue dead.

## What Changes

- **Photo/video breakdown in upload indicator**: The pending upload banner distinguishes between images and videos, showing counts like "3 photos, 2 videos uploading" instead of the generic "5 photos uploading".
- **Self-healing upload queue**: The queue processor gains error resilience — failed items are retried with exponential backoff (1s→2s→4s→8s→16s cap) instead of being skipped, processing locks are always released even on unexpected errors, and a periodic health check clears genuinely stuck items.
- **Dynamic upload icon**: The banner icon reflects queue contents — `photo` for image-only, `videocam` for video-only, `cloud-upload` for mixed.

## Capabilities

### Modified Capabilities
- `photo-upload`: Queue visibility (indicator breakdown), queue resilience (self-healing), and error recovery (health checks).

## Impact

- `src/screens/PhotosList/components/PendingPhotosBanner.js` — display update with photo/video counts
- `src/screens/PhotosList/upload/usePhotoUploader.js` — self-healing queue processor
- `src/screens/PhotosList/upload/photoUploadService.js` — skip-on-failure behavior in `processCompleteUpload` path