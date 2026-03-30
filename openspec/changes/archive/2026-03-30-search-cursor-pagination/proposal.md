## Why

When searching via the FAB on the photo feed, the `feedByDate` query pages by day (`daysAgo`). If a search term doesn't match any photos on the current day, the client receives an empty response and stops loading — even though matching photos may exist on later days. The same issue affects `feedForWatcher` with page-based pagination. The backend now returns a `nextPage` cursor in both feed responses, enabling the client to skip empty pages and continue loading until results are found or data is exhausted.

## What Changes

- Add `nextPage` to the GraphQL response fields for both `FEED_BY_DATE_QUERY` and `FEED_FOR_WATCHER_QUERY`
- Update `requestGeoPhotos` and `requestWatchedPhotos` in the reducer to return `nextPage` from the backend response
- Update `load()` in PhotosList to read `noMoreData` and `nextPage` from `getPhotos()`:
  - When search is active and a page returns empty but `noMoreData` is false, auto-page using `nextPage` as the cursor (recursive call to `load()`)
  - When photos are returned and `nextPage` is provided, update `pageNumber` to `nextPage` so subsequent `handleLoadMore` starts from the correct offset
  - When `noMoreData` is true, stop loading immediately
  - When no search term is active, preserve the existing consecutive-empty heuristic for normal day-by-day feed paging

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `search-fab`: Update search pagination behavior — when search is active, use backend `nextPage` cursor for auto-paging through empty results instead of stopping on first empty response
- `photo-feed`: Update feed data flow — `load()` reads `noMoreData` and `nextPage` from backend, uses `noMoreData` for authoritative stop-loading decisions, and sets `pageNumber` from `nextPage` cursor when provided

## Impact

- `src/screens/PhotosList/reducer.js` — Add `nextPage` to both GraphQL query response fields and return objects from `requestGeoPhotos`/`requestWatchedPhotos`
- `src/screens/PhotosList/index.js` — Rework `load()` empty-response handling to branch on `noMoreData`/`nextPage`/search-active state; update `pageNumber` from `nextPage` when photos are returned
