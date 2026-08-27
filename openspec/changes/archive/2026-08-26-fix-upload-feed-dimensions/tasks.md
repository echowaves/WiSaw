## 1. Queue removal by stable key (photo-upload capability)

- [x] 1.1 Change `removeFromQueue` in `src/screens/PhotosList/upload/photoUploadService.js` to match stored entries by `photoId` instead of whole-object `JSON.stringify` equality
- [x] 1.2 Change `updateQueueItem` in `src/screens/PhotosList/upload/photoUploadService.js` to match stored entries by `photoId` for the same reason
- [x] 1.3 Add a dev-mode console warning when `removeFromQueue`/`updateQueueItem` fail to find a matching `photoId`, so future enrichment mismatches are visible

## 2. Photo lookup dimension contract (photo-upload capability)

- [x] 2.1 Add `width` and `height` to the `getPhotoById` GraphQL selection in `src/screens/PhotosList/upload/photoUploadService.js` (backend `Photo` type already declares both as nullable `Int` — verify against `graphql/schema.graphql` in Wisaw.cdk)
- [x] 2.2 Confirm the INACTIVE/MISSING paths still fall back to `ensurePhotoDimensions` when the lookup returns null/missing dimensions (no code change expected — verify only)

## 3. Re-entrancy guard (upload-orchestration capability)

- [x] 3.1 At the top of `processQueue` in `src/screens/PhotosList/upload/usePhotoUploader.js`, return early when `processingRef.current` is already true
- [x] 3.2 In the guarded no-op path, re-read the queue and, if non-empty, schedule a retry via `scheduleRetry(RETRY_DELAY_MS)` before returning, so an enqueue landing after the in-flight pass's final queue read is not dropped

## 4. Masonry fallback ratio (photo-feed capability)

- [x] 4.1 Pass `aspectRatioFallbacks={segmentConfig.aspectRatioFallbacks}` to `ExpoMasonryLayout` in `src/components/PhotosListMasonry/index.js`
- [x] 4.2 Verify `PhotoSelectionMode` (which sets `aspectRatioFallbacks` explicitly) is unaffected

## 5. Feed dedup preference (feed-loader-hook capability)

- [x] 5.1 In the `subscribeToUploadComplete` handler in `src/hooks/useFeedLoader.js`, skip an incoming photo when an existing list entry with the same `id` has valid positive `width`/`height` and the incoming photo does not

## 6. Verification

- [x] 6.1 Upload a photo from the main feed; the optimistically inserted tile SHALL have the correct aspect ratio without any screen reload (repeat ~5× to catch the backend-latency-dependent path)
- [x] 6.2 Upload a photo from Wave Detail with an active wave; the same SHALL hold in the wave detail grid
- [x] 6.3 Capture two photos in quick succession (queue of 2) and verify each uploads, is removed from the queue exactly once, and appears exactly once in the feed with correct dimensions
- [x] 6.4 Toggle network off/on mid-upload (or throttle) to exercise the retry path; verify no duplicate tiles and no stuck queue items
- [x] 6.5 Restart the app with a pending-queue item whose stored entry was enriched by an older in-flight pass, and verify it still uploads correctly after the key-matching change
- [x] 6.6 Confirm `npx ts-standard` (or the project's lint gate) reports no new errors vs baseline
