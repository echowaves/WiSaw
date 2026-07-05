## 1. Add photoId to queue items

- [x] 1.1 Add `getPhotoById` GraphQL query definition in `photoUploadService.js` (Apollo Client query)
- [x] 1.2 Modify `queueFileForUpload()` to generate `photoId = crypto.randomUUID()` and add it to the queue item
- [x] 1.3 Verify queue item structure includes: `photoId`, `originalCameraUrl`, `localImageName`, `type`, `localCacheKey`, `waveUuid`, `location`

## 2. Update processCompleteUpload with three-state flow

- [x] 2.1 Restructure `processCompleteUpload()` to read `photoId` from queue item (always present)
- [x] 2.2 Add state detection: call `getPhotoById(photoId, uuid)` before any other operations
- [x] 2.3 Implement State ACTIVE branch: if `existing && existing.active` → remove from queue, return existing photo
- [x] 2.4 Implement State INACTIVE branch: if `existing && !existing.active` → skip `generatePhoto()`, proceed directly to `uploadItem()` with known `photoId`
- [x] 2.5 Implement State MISSING branch: if `!existing` → call `generatePhoto()` with `photoId` parameter, then upload

## 3. Update generatePhoto to accept photoId

- [x] 3.1 Modify `generatePhoto()` to accept `photoId` as a parameter
- [x] 3.2 Update the `createPhoto` mutation to include `photoId` as a required variable in the GraphQL query
- [x] 3.3 Handle server returning existing photo on duplicate (idempotent response) — if `createPhoto` returns a photo that already exists, use it and proceed to S3 upload
- [x] 3.4 Ensure `photoId` is stored in queue item after successful creation: `processedItem = { ...processedItem, photo, photoId }`

## 4. Update uploadItem to use photoId

- [x] 4.1 Modify `uploadItem()` to accept `photoId` from the queue item
- [x] 4.2 Ensure S3 asset keys use the stable `photoId`: `${photoId}.upload` for images, `${photoId}.mov` for videos
- [x] 4.3 Verify `generateUploadUrl` query uses the correct `photoId`-based asset key

## 5. Update queue management functions

- [x] 5.1 Ensure `updateQueueItem()` preserves the `photoId` field when updating item metadata (uses JSON.stringify which preserves all properties)
- [x] 5.2 Ensure `removeFromQueue()` works correctly with items that have `photoId` (uses JSON.stringify comparison)
- [x] 5.3 Verify `initPendingUploads()` logs items with and without `photoId` for debugging
- [x] 5.4 Test queue persistence: items survive app restart with `photoId` intact (stored in AsyncStorage via JSON)

## 6. Error handling and edge cases

- [x] 6.1 Handle `getPhotoById` network error: catch block treats as "missing" and proceeds to create
- [x] 6.2 Handle `createPhoto` returning existing photo (idempotent): server returns existing photo, client uses it and proceeds to S3 upload
- [x] 6.3 Handle race condition: two rapid captures generating same UUID (shouldn't happen, but primary key constraint catches it)
- [x] 6.4 Handle backend error on duplicate: server returns existing photo idempotently (no error), client uses it

## 7. Testing (manual verification after backend deployment)

- [x] 7.1 Test normal flow: capture → queue → create → S3 upload → active
- [x] 7.2 Test State ACTIVE: photo exists and active → skip upload
- [x] 7.3 Test State INACTIVE: photo exists but not active → S3 upload only
- [x] 7.4 Test State MISSING: photo not found → create + S3 upload
- [x] 7.5 Test retry after timeout: same `photoId` used on retry, no duplicates created
- [x] 7.6 Test app restart: pending queue items retain `photoId` across restarts
- [x] 7.7 Test deployment order: backend change must deploy before client (photoId is required)
