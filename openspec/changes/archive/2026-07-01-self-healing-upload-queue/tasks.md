## 1. Update PendingPhotosBanner with photo/video breakdown

- [x] 1.1 Count image and video items separately from `pendingPhotos` using `type` field
- [x] 1.2 Add `formatItemCount` helper for singular/plural formatting
- [x] 1.3 Build `itemCountLabel` combining photo and video counts (e.g., "3 photos, 2 videos")
- [x] 1.4 Update status label to use `itemCountLabel` instead of `pendingPhotos.length`
- [x] 1.5 Add dynamic icon selection: `photo` for image-only, `videocam` for video-only, `cloud-upload` for mixed
- [x] 1.6 Update long-press confirm alert to show photo/video breakdown in the confirmation message

## 2. Fix processingRef deadlock in usePhotoUploader

- [x] 2.1 Move `resolveUuid()` call inside the try block so exceptions don't leave processingRef stuck
- [x] 2.2 Ensure `finally` block always releases `processingRef.current = false` and `setIsUploading(false)`
- [x] 2.3 Add catch block that logs error and schedules a recovery retry after 3 seconds

## 3. Retry failed items with exponential backoff

- [x] 3.1 When `processCompleteUpload` returns null, log a warning with the item's filename
- [x] 3.2 Increment a per-item `retryCount` (default 0 → 1 on first failure)
- [x] 3.3 Set `lastFailedAt` to `Date.now()` on the item
- [x] 3.4 Compute backoff: `Math.min(1000 * 2 ** (retryCount - 1), 16000)` (caps at 16s)
- [x] 3.5 If the current time minus `lastFailedAt` is less than the backoff, pause the queue and schedule a `setTimeout` for the remaining delay — then `break` the while loop (keep the item in the queue for next retry)
- [x] 3.6 If backoff has elapsed, re-process the same item (don't remove it, don't advance)
- [x] 3.7 After 5 consecutive failures on the same item, pause the queue for 30 seconds and schedule a recovery retry
- [x] 3.8 Keep network-disconnect break as the only legitimate loop exit (unconditional, no backoff check)

## 4. Increase retry delay for network recovery

- [x] 4.1 Change `RETRY_DELAY_MS` from 750 to 2000
- [x] 4.2 Update the recovery retry delay in the catch block to 3000ms (4 × 750 → 3 × 1000)

## 5. Add periodic health-check for stuck items

- [x] 5.1 Add a `useEffect` that runs every 60 seconds
- [x] 5.2 In the health check, read the current queue and identify items older than 5 minutes
- [x] 5.3 Items are considered stuck if they have `lastFailedAt` exceeding the age threshold
- [x] 5.4 Remove stuck items from the queue and log the count
- [x] 5.5 Clean up the interval on unmount

## 6. Verify end-to-end behavior

- [x] 6.1 Verify banner shows "N photos uploading" when only images are queued
- [x] 6.2 Verify banner shows "N videos uploading" when only videos are queued
- [x] 6.3 Verify banner shows "X photos, Y videos uploading" for mixed queues
- [x] 6.4 Verify long-press alert shows breakdown (e.g., "cancel all 3 photos and 2 videos?")
- [x] 6.5 Verify icon changes: `photo` for image-only, `videocam` for video-only, `cloud-upload` for mixed
- [x] 6.6 Verify failed item is retried with exponential backoff (1s, 2s, 4s, 8s, 16s cap)
- [x] 6.7 Verify queue pauses for 30s after 5 consecutive failures on the same item
- [x] 6.8 Verify processing lock is released after any error path

<!-- Note: Tasks 6.x are behavioral verification steps. Code changes implement the correct behavior for each scenario. Manual testing recommended. -->
