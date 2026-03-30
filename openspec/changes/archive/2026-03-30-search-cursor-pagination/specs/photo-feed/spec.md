## MODIFIED Requirements

### Requirement: Location-Based Feed Filtering
The system SHALL filter the Global feed to show only photos taken near the user's current GPS location, reading coordinates from the global `locationAtom`. After auto-grouping, newly wave-assigned photos SHALL continue to appear in the Global feed as before; wave assignment does not remove photos from the location-based feed. The feed query SHALL NOT accept a wave filtering parameter. The feed SHALL show appropriate UI states while location is pending or denied. When location is unavailable, the Starred segment SHALL still load and function normally — only the geo feed segment SHALL require location coordinates. The feed SHALL NOT automatically reload when coordinates change; instead, the user SHALL be notified via a drift banner and must manually trigger a reload.

#### Scenario: User has location permission granted
- **WHEN** `locationAtom.status` is `ready` and the feed is fetched
- **THEN** only photos within the configured proximity radius are displayed
- **THEN** the `feedForWatcher` query is called with coordinates from `locationAtom.coords`

#### Scenario: Location is pending
- **WHEN** `locationAtom.status` is `pending`
- **THEN** the feed SHALL display a banner at the top: "Obtaining your location..."
- **THEN** the feed content area SHALL show an empty state card with message "We're finding your location so we can show nearby photos"
- **THEN** the feed SHALL NOT call the geo query (no coordinates available)
- **THEN** when the atom transitions to `ready`, the feed SHALL automatically load once and snapshot `feedLocationRef`

#### Scenario: Location permission denied
- **WHEN** `locationAtom.status` is `denied`
- **THEN** the feed SHALL display a banner: "Location access needed" with a "Settings" link
- **THEN** the feed content area SHALL show an empty state card with message explaining location is required and a button to open Settings
- **THEN** the feed SHALL NOT call the geo query

#### Scenario: Watched photos load without location
- **WHEN** `locationAtom.status` is `pending` or `denied` and `activeSegment` is 1 (Starred)
- **THEN** the Starred photos query SHALL execute normally using `uuid`, `pageNumber`, and `batch`
- **THEN** the user SHALL see their Starred photos regardless of location state

#### Scenario: Search loads without location via FAB
- **WHEN** `locationAtom.status` is `pending` or `denied` and `searchTerm` is non-empty
- **THEN** the search term SHALL be passed as an optional parameter to the active segment's feed endpoint (`feedByDate` or `feedForWatcher`)
- **THEN** the standalone `feedForTextSearch` endpoint SHALL NOT be used (it is reserved for the web app)
- **THEN** search results SHALL be displayed regardless of location state

#### Scenario: Feed data flow uses explicit parameters
- **WHEN** `load()` is called from `reload()`, `submitSearch()`, `handleClearSearch()`, or `handleLoadMore()`
- **THEN** `load()` SHALL accept explicit override parameters `(segmentOverride, searchTermOverride, signal, pageOverride)` to prevent stale React state closures
- **THEN** `load()` SHALL read `{ photos, batch, noMoreData, nextPage }` from `getPhotos()`
- **THEN** `reload()` SHALL always pass page 0 explicitly to `load()`
- **THEN** `handleLoadMore()` SHALL compute the new page inside `setPageNumber`'s state updater and pass it via `load(null, null, null, newPage)`
- **THEN** `submitSearch()` SHALL call `reload(activeSegment, searchTerm)` without redundant state resets
- **THEN** `handleClearSearch()` SHALL call `reload(activeSegment, '')` passing the empty string explicitly

#### Scenario: Empty response handling branches on search state
- **WHEN** `load()` receives an empty photos array
- **THEN** if `noMoreData` is true, `stopLoading` SHALL be set to true regardless of search state
- **THEN** if search is active and `noMoreData` is false and `nextPage` is provided, `load()` SHALL auto-page by recursively calling itself with `nextPage`
- **THEN** if no search term is active, the existing consecutive-empty heuristic SHALL apply (stop on first empty if list is empty, or after 10 consecutive empties)

#### Scenario: Successful response updates page cursor
- **WHEN** `load()` receives photos and `nextPage` is provided in the response
- **THEN** `pageNumber` SHALL be updated to `nextPage` via `setPageNumber(nextPage)`
- **THEN** subsequent `handleLoadMore` calls SHALL start from the updated page number

#### Scenario: Photos remain in feed after auto-grouping
- **WHEN** photos are assigned to waves via auto-grouping
- **THEN** those photos SHALL still appear in the Global feed based on location proximity

#### Scenario: Location drift shows banner instead of auto-reload
- **WHEN** the `locationAtom` coords change during normal use
- **THEN** the feed SHALL NOT automatically reload
- **THEN** if the drift between `feedLocationRef` and live coords exceeds 500 meters on segment 0, a `LocationDriftBanner` SHALL be shown
- **THEN** the user SHALL manually trigger a reload (pull-to-refresh, segment tap, or banner tap) to update the feed

#### Scenario: Feed reload snapshots location
- **WHEN** the feed reloads via any trigger (pull-to-refresh, segment tap, banner tap, initial load, network reconnect)
- **THEN** `feedLocationRef.current` SHALL be set to the current `locationAtom.coords`
- **THEN** the feed query SHALL use the current `locationAtom.coords`
