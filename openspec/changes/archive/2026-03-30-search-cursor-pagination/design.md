## Context

The photo feed uses two GraphQL queries: `feedByDate` (Global segment, pages by `daysAgo`) and `feedForWatcher` (Starred segment, pages by `pageNumber`). When the FAB search is active, the search term is passed as an optional parameter to these same endpoints. The backend now returns `nextPage` alongside `noMoreData` in both responses — `nextPage` is a cursor indicating where the next query should start.

Currently, `load()` ignores `noMoreData` and uses a client-side heuristic: stop on the first empty response if the list is empty, or after 10 consecutive empties. This works for the normal feed (where most days have photos nearby) but fails for search (where matching photos may be sparse across many days/pages).

## Goals / Non-Goals

**Goals:**
- Use the backend's `nextPage` cursor to skip empty days/pages when search is active
- Use the backend's `noMoreData` flag as the authoritative stop signal
- Auto-page through empty results during search until content is found or data is exhausted
- Keep the existing consecutive-empty heuristic for non-search paging (backward compatible)

**Non-Goals:**
- Changing the backend API contract (backend changes are already deployed)
- Adding parallel/batched requests for faster scanning
- Modifying the masonry layout or UI — this is purely data-fetching logic
- Changing `handleLoadMore` behavior — it still increments from the current page

## Decisions

### 1. Read `noMoreData` and `nextPage` from backend response

**Decision**: Destructure `{ photos, batch, noMoreData, nextPage }` from `getPhotos()` in `load()`. Add `nextPage` to both GraphQL query response fields and propagate it through `requestGeoPhotos`, `requestWatchedPhotos`, and `getPhotos`.

**Rationale**: The backend already computes these values. The client was ignoring `noMoreData` entirely and relying on a fragile heuristic. Using the backend's signal is more reliable and eliminates the "stop too early" bug.

### 2. Three-branch empty-response handling in `load()`

**Decision**: When `photos` is empty, branch on three conditions:

1. **`noMoreData` is true** → `setStopLoading(true)` — backend says we're done, stop unconditionally
2. **Search active + `nextPage` provided** → auto-page: update `pageNumber` to `nextPage` and recursively call `load()` with the new page — skip the empty gap
3. **No search term** → fall back to the existing consecutive-empty heuristic (stop on first empty if list is empty, or after 10 consecutive empties)

**Rationale**: Branch 1 is the authoritative stop. Branch 2 solves the sparse-search problem with a single recursive call per empty page (the backend skips internally, so `nextPage` could jump many days). Branch 3 preserves backward compatibility for the normal geo feed where day-by-day paging with the heuristic works well.

**Alternative considered**: Always using `noMoreData` for both search and non-search. Rejected because the non-search feed currently relies on the consecutive-empty heuristic, and changing it could alter existing pagination behavior — unnecessary risk for no user-facing benefit.

### 3. Update `pageNumber` from `nextPage` on successful response

**Decision**: When `load()` receives photos AND `nextPage` is provided, call `setPageNumber(nextPage)`. This ensures the next `handleLoadMore` (triggered by `onEndReached`) starts from the correct offset rather than blindly incrementing by 1.

**Rationale**: Without this, `handleLoadMore` would call `load(null, null, null, currentPage + 1)` which could re-query a page the backend already skipped past. Setting `pageNumber` to `nextPage` keeps the client and backend cursors in sync. For `feedByDate`, `nextPage` means "next daysAgo to query." For `feedForWatcher`, it means "next page offset."

### 4. Recursive `load()` for auto-paging respects abort signal

**Decision**: Before the recursive `load()` call, check `signal?.aborted`. The recursive call passes the same `signal` through, so aborting the parent (via segment switch or screen blur) cancels the entire auto-page chain.

**Rationale**: Without this guard, a long auto-page chain (scanning through many empty days) could continue running after the user switches segments or navigates away, causing stale state updates.

## Risks / Trade-offs

- [Trade-off: Recursive call stack depth] If the backend returns `nextPage` but keeps returning empty results for many consecutive calls, the recursion depth could grow. In practice this is bounded — the backend should eventually return `noMoreData: true` when it exhausts the data range. If the backend misbehaves (always returns `nextPage` with empty results), the call stack would grow. This is mitigated by the abort signal (segment switches cancel the chain).
- [Trade-off: Non-search paging unchanged] The normal feed still uses the consecutive-empty heuristic rather than `noMoreData`. This means `noMoreData` is partially adopted. Acceptable because changing non-search behavior is out of scope and the heuristic works well for the normal feed.
- [Risk: Backend `nextPage` not deployed] If the backend hasn't deployed the `nextPage` field yet, the GraphQL response will return `null` for `nextPage`. The client handles this gracefully — the `nextPage != null` check means it falls through to the existing heuristic. No breakage.
