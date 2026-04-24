## Why

Search pagination is broken after the switch to column-mode masonry layout. The feed sends one search request and stops — VirtualizedList's `onEndReached` fires once but never fires again because the column layout produces fewer, taller "bands" that fit within the viewport. VirtualizedList's internal `_hasDataChangedSinceEndReached` flag gets consumed by `_onContentSizeChange` before `componentDidUpdate` can reset it, so subsequent data appends don't re-trigger the callback.

## What Changes

- Add auto-page logic in `useFeedLoader` so that when a search-mode load completes and returns photos but `noMoreData` is `false`, the loader continues fetching the next page without waiting for `onEndReached`. This mirrors the existing auto-page behavior for empty search responses (which already recursively calls `load()` when `photos.length === 0 && searchTerm && nextPage != null`), extending it to non-empty responses during search.

## Capabilities

### New Capabilities
_(none)_

### Modified Capabilities
- `feed-loader-hook`: Add auto-page continuation for search mode when results are returned but more data exists

## Impact

- **Modified file**: `src/screens/PhotosList/hooks/useFeedLoader.js` — extend `load()` to auto-page during search
- **All screens benefit**: PhotosList, BookmarksList, FriendDetail, WaveDetail — all use `useFeedLoader`
- **Risk**: Low — the auto-page path already exists for empty search responses; this extends it to non-empty ones. Abort signal prevents runaway chains. Batch ID prevents stale responses.
