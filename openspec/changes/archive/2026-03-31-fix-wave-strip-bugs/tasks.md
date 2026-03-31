## 1. Fix WavePhotoStrip Pagination

- [x] 1.1 Change initial `pageNumber` state from `0` to `-1` in `WavePhotoStrip/index.js`
- [x] 1.2 Add deduplication logic in `handleLoadMore`: collect existing photo IDs into a `Set`, filter fetched photos to exclude duplicates before appending
- [x] 1.3 Verify `UngroupedPhotosCard` still works correctly (it fetches page 0 on mount separately, so its strip should paginate from page 1 onward)

## 2. Add Photo Long Press to WavePhotoStrip

- [x] 2.1 Add `onPhotoLongPress` prop to `WavePhotoStrip` component signature
- [x] 2.2 Wrap each `CachedImage` thumbnail in a `Pressable` with `onLongPress` when `onPhotoLongPress` is provided; render plain `CachedImage` when not provided
- [x] 2.3 In `WaveCard`, pass `onPhotoLongPress={() => onLongPress(wave)}` to `WavePhotoStrip`
