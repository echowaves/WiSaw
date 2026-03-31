## Why

When a user searches for a tag in the geo feed and scrolls to load more results, the paginated request drops the search term. The API returns unfiltered photos which get merged into the search results, showing photos that don't match the search query. The bug is in `useFeedLoader.handleLoadMore()` which passes `null` for `searchTermOverride`, and `getFetchParams()` does not include `searchTerm`, so the effective search term falls back to an empty string on pagination.

## What Changes

- Store the active search term inside `useFeedLoader` via a ref so `handleLoadMore` automatically carries the search context
- `reload()` stashes the search term override in the ref
- `handleLoadMore()` reads from the ref instead of relying on the caller to pass it
- No changes needed to any screen-level code — the fix is entirely internal to the hook

## Capabilities

### New Capabilities

(none)

### Modified Capabilities
- `feed-loader-hook`: `handleLoadMore` SHALL preserve the active search term across paginated requests

## Impact

- `src/screens/PhotosList/hooks/useFeedLoader.js` — add search term ref, update `reload()` and `handleLoadMore()`
- Affects all feed consumers (PhotosList, BookmarksList) — fix is transparent, no call-site changes needed
