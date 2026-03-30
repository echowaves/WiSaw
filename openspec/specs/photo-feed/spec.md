## Requirements

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
- **THEN** `reload()` SHALL always pass page 0 explicitly to `load()`
- **THEN** `handleLoadMore()` SHALL compute the new page inside `setPageNumber`'s state updater and pass it via `load(null, null, null, newPage)`
- **THEN** `submitSearch()` SHALL call `reload(activeSegment, searchTerm)` without redundant state resets
- **THEN** `handleClearSearch()` SHALL call `reload(activeSegment, '')` passing the empty string explicitly

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

### ~~Requirement: PhotosList search bar keyboard handling~~
**REMOVED**: Replaced by the SearchFab component which uses absolute positioning and `useReanimatedKeyboardAnimation` instead of `KeyboardStickyView`. The search segment (segment 2) no longer exists. Search input is now handled by `SearchFab` (see `search-fab` capability).

### Requirement: Photo feed state management
The PhotosList screen SHALL store its photo array in screen-local state (`useState`) rather than a global Jotai atom. Photos SHALL be frozen via `createFrozenPhoto` at write boundaries (fetch and upload callbacks). The screen SHALL provide a `PhotosListContext` with a `removePhoto` function that filters the local state, consistent with WaveDetail's pattern. Upload state (`pendingPhotos`, `isUploading`, `enqueueCapture`, `clearPendingQueue`) SHALL be consumed from `UploadContext` instead of instantiating a local `usePhotoUploader`. Upload completions SHALL be received via the upload bus subscription. The screen SHALL subscribe to the `photoDeletionBus` and remove matching photos from its local state when a deletion event is received from another screen. The screen SHALL maintain an `AbortController` ref to cancel in-flight `reload()`/`load()` async chains when a new segment switch occurs or when the screen loses focus. All `setState` calls within async `load()`/`reload()` functions SHALL check `signal.aborted` before executing. The `pageNumber` useEffect SHALL be removed; pagination SHALL trigger `load()` explicitly from the pagination call site.

#### Scenario: PhotosList initializes with empty local state
- **WHEN** the PhotosList screen mounts
- **THEN** the photo array SHALL be initialized as an empty array via `useState([])`
- **THEN** no global Jotai atom SHALL be used for the photo list

#### Scenario: Fetched photos are frozen at write boundary
- **WHEN** photos are fetched from the API
- **THEN** each photo SHALL be passed through `createFrozenPhoto` before being stored in local state

#### Scenario: Uploaded photo is frozen at write boundary
- **WHEN** the upload bus emits a successful upload event
- **THEN** the uploaded photo SHALL be passed through `createFrozenPhoto` before being prepended to local state

#### Scenario: Photo deleted from expanded view updates local state
- **WHEN** a photo is deleted from within the expanded `Photo` component
- **THEN** `removePhoto` from `PhotosListContext` SHALL filter the photo from the local `useState` array
- **THEN** the masonry grid SHALL re-render without the deleted photo

#### Scenario: Upload state consumed from context
- **WHEN** PhotosList needs `pendingPhotos`, `isUploading`, `enqueueCapture`, or `clearPendingQueue`
- **THEN** it SHALL consume them from `UploadContext` via `useContext`
- **THEN** it SHALL NOT instantiate its own `usePhotoUploader`

#### Scenario: Cross-screen photo deletion received
- **WHEN** a `photoDeletionBus` event is emitted with a photo ID
- **THEN** the PhotosList SHALL remove the matching photo from its local `useState` array

#### Scenario: Segment switch cancels in-flight loads
- **WHEN** the user taps a different segment while a `reload()` or `load()` chain is in flight
- **THEN** the previous AbortController SHALL be aborted
- **THEN** a new AbortController SHALL be created for the new reload chain
- **THEN** all `setState` calls from the aborted chain SHALL be skipped

#### Scenario: Screen blur cancels in-flight loads
- **WHEN** the user navigates away from PhotosList (e.g., to Waves via drawer or header icon)
- **THEN** the current AbortController SHALL be aborted
- **THEN** no further `setState` calls from the in-flight chain SHALL execute

#### Scenario: Pagination triggers load explicitly
- **WHEN** the masonry grid reaches the end threshold and more data is available
- **THEN** `setPageNumber` SHALL be called with the next page number
- **THEN** `load()` SHALL be called explicitly from the same handler
- **THEN** no `useEffect` watching `pageNumber` SHALL exist

### Requirement: Photo feed reloads on identity change
The PhotosList screen SHALL subscribe to identity-change events and reload the active segment when the user's identity is established, updated, or reset.

#### Scenario: Identity registered while on watchers tab
- **WHEN** the user registers an identity and `emitIdentityChange()` fires
- **THEN** PhotosList SHALL call `reload()` to refetch the current segment's data
- **THEN** the watchers tab SHALL display the user's watched photos from the server

#### Scenario: Identity changed while PhotosList is unmounted
- **WHEN** `emitIdentityChange()` fires but the PhotosList component is not mounted
- **THEN** no reload SHALL occur (the subscription is cleaned up on unmount)

#### Scenario: Subscription cleanup on unmount
- **WHEN** the PhotosList component unmounts
- **THEN** the identity-change listener SHALL be unsubscribed to prevent memory leaks

## REMOVED Requirements

### Requirement: PhotosList reads global network atom
The PhotosList screen SHALL read `STATE.netAvailable` via `useAtom` instead of using the local `useNetworkStatus` hook. The `useNetworkStatus` hook file SHALL be deleted.

#### Scenario: PhotosList uses atom for network state
- **WHEN** the PhotosList component renders
- **THEN** it SHALL read `STATE.netAvailable` via `useAtom`
- **THEN** it SHALL NOT import or call `useNetworkStatus`

### Requirement: getZeroMoment offline guard
The `getZeroMoment()` function SHALL accept a `netAvailable` parameter. When `netAvailable` is `false`, it SHALL return `0` immediately without making a GraphQL call.

#### Scenario: getZeroMoment skips API when offline
- **WHEN** `getZeroMoment` is called with `netAvailable` equal to `false`
- **THEN** it SHALL return `0` without making a GraphQL query
- **THEN** no network error SHALL be logged

#### Scenario: getZeroMoment makes API call when online
- **WHEN** `getZeroMoment` is called with `netAvailable` equal to `true`
- **THEN** it SHALL make the GraphQL query as normal

## REMOVED Requirements

### Requirement: Drawer menu button badge for upload target wave
**Reason**: The upload target concept is being removed entirely. The nav menu button no longer needs to indicate upload target status.
**Migration**: No migration needed. The nav menu button becomes a plain drawer opener.
