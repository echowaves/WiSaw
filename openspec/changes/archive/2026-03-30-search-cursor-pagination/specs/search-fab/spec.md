## MODIFIED Requirements

### Requirement: Search applies to active segment
The system SHALL pass the `searchTerm` as an optional parameter to each segment's own feed endpoint (`feedByDate` for Global, `feedForWatcher` for Starred). The standalone `feedForTextSearch` endpoint SHALL NOT be used in the mobile app (it is reserved for the web app). Search results SHALL use the active segment's masonry layout configuration without any modifications — the layout (columns, tile size, comments overlay) SHALL remain identical to the non-search state of that segment. `isSearchActive` SHALL be derived from `searchTerm.length > 0`, not stored as separate state.

The `load()` function SHALL accept explicit override parameters `(segmentOverride, searchTermOverride, signal, pageOverride)` to prevent stale React state closures. Each parameter has a corresponding `effective*` variable that falls back to current state only if the override is null. `reload()` SHALL always pass page 0 explicitly. `handleLoadMore()` SHALL compute the new page inside `setPageNumber`'s updater and pass it explicitly to `load()`.

Both `feedByDate` and `feedForWatcher` GraphQL queries SHALL include `nextPage` in their response fields. The `load()` function SHALL read `{ photos, batch, noMoreData, nextPage }` from `getPhotos()`. When search is active and a page returns empty photos but `noMoreData` is false, `load()` SHALL auto-page by recursively calling itself with `nextPage` as the page override. When photos are returned and `nextPage` is provided, `pageNumber` SHALL be updated to `nextPage` so subsequent `handleLoadMore` starts from the correct offset. The auto-page recursion SHALL check `signal.aborted` before each recursive call to respect cancellation.

#### Scenario: Search on Global segment
- **WHEN** the user submits a search term while on the Global segment (segment 0)
- **THEN** `feedByDate` SHALL be called with the geo parameters AND `searchTerm: <term>`
- **THEN** the backend SHALL filter geo-proximate photos by the search term
- **THEN** results SHALL display in the Global segment's masonry layout (compact tiles, no comments overlay)
- **THEN** the layout SHALL NOT change from the non-search Global view

#### Scenario: Search on Starred segment
- **WHEN** the user submits a search term while on the Starred segment (segment 1)
- **THEN** `feedForWatcher` SHALL be called with the watcher parameters AND `searchTerm: <term>`
- **THEN** the backend SHALL filter watched photos by the search term
- **THEN** results SHALL display in the Starred segment's masonry layout (larger tiles with comments overlay)
- **THEN** the layout SHALL NOT change from the non-search Starred view

#### Scenario: Search term of any length
- **WHEN** the user types any number of characters in the search input
- **THEN** the search term SHALL be passed to the active segment's feed endpoint on submit
- **THEN** the backend SHALL handle filtering — there is no client-side minimum length restriction
- **THEN** feed loading SHALL NOT be blocked for short search terms

#### Scenario: Search auto-pages through empty results
- **WHEN** search is active and `load()` receives an empty photos array
- **THEN** if `noMoreData` is true, `stopLoading` SHALL be set to true
- **THEN** if `noMoreData` is false and `nextPage` is provided, `load()` SHALL recursively call itself with `nextPage` as the page override
- **THEN** `pageNumber` SHALL be updated to `nextPage` before the recursive call
- **THEN** the recursive call SHALL check `signal.aborted` before executing

#### Scenario: Search results update page cursor
- **WHEN** search is active and `load()` receives photos with a `nextPage` value
- **THEN** `pageNumber` SHALL be updated to `nextPage`
- **THEN** subsequent `handleLoadMore` calls SHALL use the updated `pageNumber` as the starting offset

#### Scenario: Pagination loads next page
- **WHEN** the user scrolls to the end of the current results
- **THEN** `handleLoadMore` SHALL compute `newPage` inside `setPageNumber`'s state updater
- **THEN** `load(null, null, null, newPage)` SHALL be called with the new page number passed explicitly
- **THEN** this SHALL prevent stale closure reads of `pageNumber`

#### Scenario: Auto-page respects abort signal
- **WHEN** the user switches segments or navigates away during an auto-page chain
- **THEN** the abort signal SHALL be checked before each recursive `load()` call
- **THEN** the auto-page chain SHALL stop immediately if the signal is aborted
