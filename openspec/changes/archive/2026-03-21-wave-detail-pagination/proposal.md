## Why

The WaveDetail screen has pagination state and logic (`handleLoadMore`, `pageNumber`, `noMoreData`) but scrolling to the bottom does not load more photos. The root cause is that `PhotosListMasonry` receives an `onEndReached` prop from WaveDetail but never calls it — its internal `onEndReached` handler only calls `setPageNumber()` directly without invoking the parent's fetch function. This means the page number increments but no network request is made.

## What Changes

- Fix `PhotosListMasonry` to call the `onEndReached` prop passed by the parent component, so WaveDetail's `handleLoadMore` (which calls both `setPageNumber` and `loadPhotos`) actually fires when the user scrolls to the bottom.
- Ensure backward compatibility: `PhotosList` (the main feed) currently relies on `setPageNumber` + its own `useEffect` watching `pageNumber` to trigger fetches — this must continue to work.

## Capabilities

### New Capabilities
_(none)_

### Modified Capabilities
- `wave-detail`: Add scenario detail for pagination actually triggering data fetch via `onEndReached` prop delegation in `PhotosListMasonry`.

## Impact

- `src/screens/PhotosList/components/PhotosListMasonry.js` — modify the internal `onEndReached` handler to call the prop when provided.
- `src/screens/WaveDetail/index.js` — may need minor adjustments to ensure `handleLoadMore` guards align with `PhotosListMasonry`'s call pattern.
- All screens that use `PhotosListMasonry` (PhotosList, WaveDetail, PhotoSelectionMode) — must be verified to still paginate correctly.
