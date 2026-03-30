## 1. Add nextPage to GraphQL queries and reducer

- [x] 1.1 Add `nextPage` to `FEED_BY_DATE_QUERY` response fields in `src/screens/PhotosList/reducer.js`
- [x] 1.2 Add `nextPage` to `FEED_FOR_WATCHER_QUERY` response fields in `src/screens/PhotosList/reducer.js`
- [x] 1.3 Include `nextPage` in the return object of `requestGeoPhotos`
- [x] 1.4 Include `nextPage` in the return object of `requestWatchedPhotos`

## 2. Update load() to use noMoreData and nextPage

- [x] 2.1 Destructure `{ photos, batch, noMoreData, nextPage }` from `getPhotos()` in `load()`
- [x] 2.2 When photos are empty and `noMoreData` is true, set `stopLoading` to true
- [x] 2.3 When photos are empty, search is active, `noMoreData` is false, and `nextPage` is provided, auto-page: update `pageNumber` to `nextPage` and recursively call `load()` with `nextPage` as page override
- [x] 2.4 Check `signal.aborted` before each recursive `load()` call
- [x] 2.5 When photos are empty and no search term is active, preserve the existing consecutive-empty heuristic
- [x] 2.6 When photos are returned and `nextPage` is provided, update `pageNumber` to `nextPage` via `setPageNumber(nextPage)`

## 3. Verify

- [x] 3.1 Test search on Global segment — verify auto-paging skips empty days and finds results
- [x] 3.2 Test search on Starred segment — verify auto-paging skips empty pages
- [x] 3.3 Test normal feed (no search) — verify existing day-by-day paging behavior is unchanged
- [x] 3.4 Test segment switch during auto-page — verify abort signal cancels the chain
- [x] 3.5 Test search that has no results anywhere — verify `noMoreData: true` stops loading
