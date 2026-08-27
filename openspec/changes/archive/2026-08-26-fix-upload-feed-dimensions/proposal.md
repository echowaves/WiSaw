## Why

After a photo upload finishes, the optimistically inserted feed tile often renders with the wrong aspect ratio (apparently random: square, portrait, or landscape) and only looks correct after a screen reload. Root cause: `processQueue` removes a completed item from the upload queue with `removeFromQueue(currentItem)`, but `currentItem` is the pre-processing snapshot while `processCompleteUpload` has already replaced the stored queue entry with the enriched `processedItem` (via `updateQueueItem`). Since `removeFromQueue` matches by whole-object `JSON.stringify` equality, the removal silently fails, the `while` loop re-processes the same photo, and the re-pass typically returns the backend photo via the `ACTIVE` branch of `getPhotoById` — whose selection omits `width`/`height`. That dimensionless photo is prepended to the feed, wins first-wins dedup over the correctly dimensioned one, and the masonry falls back to an id-seeded random aspect ratio (the library's 7-value `DEFAULT_ASPECT_RATIOS`), because `PhotosListMasonry` never passes `BOOKMARK_LAYOUT_CONFIG.aspectRatioFallbacks` to `ExpoMasonryLayout`.

## What Changes

- Upload queue items are removed by stable key (`photoId`) instead of whole-object JSON equality, so an item is removed exactly once after successful upload and never re-processed (fixes the double-processing that produces the dimensionless emit).
- The `getPhotoById` GraphQL selection is extended with `width` and `height`, so the `ACTIVE` re-entry path emits a fully dimensioned photo even if a re-pass occurs.
- `processQueue` becomes re-entrancy-guarded: while a queue pass is in flight, concurrent invocations (capture enqueue, network re-availability) are no-ops instead of interleaving.
- `PhotosListMasonry` passes `segmentConfig.aspectRatioFallbacks` to `ExpoMasonryLayout`, so photos lacking valid dimensions render with the configured fallback ratio (square for the feed) instead of the library's id-seeded random ratios.
- Feed upload-completion dedup prefers the entry that has valid dimensions when both an existing and a newly emitted photo share an `id`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `photo-upload`: queue removal by stable key with single-removal/single-emit guarantee; `getPhotoById` dimension contract.
- `upload-orchestration`: `processQueue` re-entrancy guard.
- `photo-feed`: masonry must pass configured `aspectRatioFallbacks` so missing-dimension photos fall back to the configured ratio.
- `feed-loader-hook`: upload-completion dedup prefers the dimensioned photo entry.

## Impact

- `src/screens/PhotosList/upload/photoUploadService.js` — `removeFromQueue` signature/semantics, `getPhotoById` query selection.
- `src/screens/PhotosList/upload/usePhotoUploader.js` — re-entrancy guard in `processQueue`, removal call site.
- `src/components/PhotosListMasonry/index.js` — wire `aspectRatioFallbacks` from `segmentConfig`.
- `src/hooks/useFeedLoader.js` — upload-event dedup preference.
- No API changes, no backend changes, no dependency changes. All affected screens (PhotosList, WaveDetail, WavesHub) consume the same masonry/loader components, so the fix applies to them all.
