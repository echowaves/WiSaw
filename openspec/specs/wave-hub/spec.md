## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for wave hub in WiSaw.
## Requirements
### Requirement: Search State Synchronization

**GIVEN** the user is viewing the Waves Hub screen
**WHEN** the user types in the search input
**THEN** the debounced search value SHALL be correctly passed to the `listWaves` GraphQL query
**AND** `handleRefresh` SHALL use the current `debouncedSearch` value (not a stale closure value)
**AND** the React `useCallback` for `handleRefresh` SHALL include `debouncedSearch` in its dependency array

### Requirement: No Stale Closures

**GIVEN** the user types a search query and the debounced value updates
**WHEN** the `useEffect` that depends on `debouncedSearch` fires and calls `handleRefresh`
**THEN** `handleRefresh` SHALL read the **current** value of `debouncedSearch` from its closure
**AND** `handleRefresh` SHALL NOT capture a stale initial value

### Requirement: Waves Badge Updates
The system SHALL update badge counts and refresh the waves list when auto-grouping completes. For upload completions, the system SHALL only update the ungrouped photo count badge. Auto-group SHALL call `handleRefresh()` to reload the waves list (showing newly grouped photos), while upload SHALL call only `getUngroupedPhotosCount()` for a lightweight badge update.

#### Scenario: Waves list refreshes after auto-group completes
- **WHEN** the auto-group operation completes and `emitAutoGroupDone()` is called
- **THEN** the WavesHub component SHALL have a `subscribeToAutoGroupDone()` listener registered
- **THEN** the listener SHALL call `handleRefresh()` to reload the waves list from the server
- **THEN** the waves list SHALL show newly grouped photos in their correct waves
- **THEN** the ungrouped photos badge SHALL reflect the updated count (already set by `runAutoGroup()` via `setUngroupedPhotosCount(result.photosRemaining)`)

#### Scenario: Badge updates after upload completes
- **WHEN** a photo upload completes and `emitUploadComplete()` is called
- **THEN** the WavesHub component SHALL have a `subscribeToUploadComplete()` listener registered
- **THEN** the listener SHALL call `getUngroupedPhotosCount({ uuid })` to update only the ungrouped count badge
- **THEN** the waves list SHALL NOT be reloaded (no waves changed during upload)
- **THEN** the badge on the auto-group button SHALL display the updated ungrouped count

### Requirement: Waves List Focus Refresh
The system SHALL re-fetch the waves list and ungrouped photo count from the API every time the Waves screen gains focus, ensuring wave names, photo counts, thumbnails, and the ungrouped badge reflect the latest server state. The refresh SHALL preserve the current sort order. The system SHALL prevent concurrent duplicate fetches using a ref-based loading guard, and SHALL skip the initial debounced-search effect on mount so that only `useFocusEffect` triggers the first load. The `useFocusEffect` callback SHALL be wrapped in `useCallback` (required by the React Navigation API to prevent infinite re-render loops), and the loading guard ref SHALL be reset to `false` at the start of each focus callback to prevent stale lock-outs from prior navigations. Thumbnail `Photo` objects (with `id` and `thumbUrl`) SHALL be obtained from the `photos` field of the `listWaves` query response, eliminating separate per-wave thumbnail queries. `WaveCard` SHALL pass `wave.photos` as `initialPhotos` to `WavePhotoStrip`, which SHALL use `CachedImage` with `cacheKey` `${photo.id}-thumb` and React `key` `photo.id`. The `handleRefresh` function (used by FlatList pull-to-refresh) SHALL perform the same state resets as the focus callback: reset `loadingRef.current` to `false`, reset `noMoreData` to `false`, and call `fetchCounts()`, so that pull-to-refresh produces identical results to gaining focus.

#### Scenario: User returns to Waves screen after viewing wave detail
- **WHEN** the Waves screen (WavesHub) regains focus (via `useFocusEffect`)
- **THEN** the system SHALL reset pagination and call `loadWaves` with page 0, a new batch UUID, and the current `sortBy`/`sortDirection` values in refresh mode
- **THEN** the waves list SHALL be replaced with the fresh server response including updated names, photo counts, and thumbnail URLs in the current sort order

#### Scenario: Repeated visits always refresh
- **WHEN** the user navigates away from the Waves screen and returns multiple times without changing sort or search
- **THEN** each return SHALL trigger a fresh `loadWaves` call
- **THEN** the `loadingRef` guard SHALL prevent concurrent duplicate fetches if the previous call is still in-flight

#### Scenario: First mount triggers single fetch
- **WHEN** the Waves screen mounts for the first time
- **THEN** the `useFocusEffect` SHALL trigger `loadWaves` exactly once
- **THEN** the `debouncedSearch` effect SHALL skip its initial invocation (detected via a mount ref)
- **THEN** no concurrent duplicate fetch SHALL occur

#### Scenario: Concurrent fetch prevention
- **WHEN** `loadWaves` is called while a previous `loadWaves` call is still in progress
- **THEN** the new call SHALL be rejected via a `useRef`-based loading guard
- **THEN** the guard SHALL NOT rely on React state (which suffers from stale closures)

#### Scenario: Thumbnails loaded inline from listWaves
- **WHEN** `loadWaves` fetches the waves list
- **THEN** the `listWaves` query SHALL request `photos { id thumbUrl }` to obtain `Photo` objects from the server
- **THEN** the system SHALL NOT make separate `feedForWave` queries to fetch thumbnails
- **THEN** `WaveCard` SHALL pass `wave.photos` as `initialPhotos` to the `WavePhotoStrip` component

#### Scenario: WaveCard horizontal scroll does not conflict with card press
- **WHEN** a `WaveCard` is rendered with a `WavePhotoStrip`
- **THEN** the card outer container SHALL be a plain `View` (not `TouchableOpacity`) so horizontal scroll gestures are not intercepted
- **THEN** press and long-press handlers SHALL be attached to a `Pressable` wrapping only the info area below the strip

#### Scenario: Ungrouped count refreshes on focus
- **WHEN** the Waves index screen regains focus
- **THEN** the system SHALL call `getUngroupedPhotosCount({ uuid })` and `getWavesCount({ uuid })`
- **THEN** the results SHALL be written to the global `ungroupedPhotosCount` and `wavesCount` atoms
- **THEN** the ungrouped card visibility SHALL update based on the new count

#### Scenario: Refresh does not sync active wave
- **WHEN** `loadWaves` completes in refresh mode
- **THEN** the system SHALL NOT search for an `isActive` wave in the results
- **THEN** the system SHALL NOT call `setActiveWave`, `saveActiveWave`, or `clearActiveWave`

#### Scenario: Ungrouped photos card shown as list header
- **WHEN** `ungroupedPhotosCount > 0`
- **THEN** WavesHub SHALL render `UngroupedPhotosCard` as the `ListHeaderComponent` of the waves FlatList
- **THEN** the card SHALL appear above all wave cards regardless of column count

#### Scenario: Ungrouped photos card hidden when count is zero
- **WHEN** `ungroupedPhotosCount` is 0 or null
- **THEN** `ListHeaderComponent` SHALL be omitted (no ungrouped card rendered)

#### Scenario: Pull-to-refresh resets loading guard
- **WHEN** the user pulls to refresh the waves list while a previous `loadWaves` call is still in-flight

### Requirement: WavePhotoStrip photos reflect latest prop updates
The `WavePhotoStrip` component SHALL sync its internal `photos` state whenever the `initialPhotos` prop changes, ensuring the photo strip always reflects the latest server data.

#### Scenario: Photos update after refresh without navigation
- **WHEN** a wave has photos [p1, p2, p3] displayed in its WavePhotoStrip
- **WHEN** a photo upload completes and `handleRefresh()` fetches fresh data
- **AND** the server returns the wave with photos [p1, p2, p3, pNew]
- **THEN** WavePhotoStrip SHALL update to show [p1, p2, p3, pNew] immediately
- **AND** pNew SHALL be visible in the strip without requiring navigation away and back

#### Scenario: Photos update on focus gain
- **WHEN** the user navigates away from the Waves screen (e.g., into WaveDetail)
- **AND** the wave data has changed on the server during that time
- **WHEN** the user returns to the Waves screen
- **THEN** the focus effect calls `loadWaves()` which provides fresh `initialPhotos`
- **THEN** WavePhotoStrip SHALL display the updated photos immediately

#### Scenario: Pagination continues after sync
- **WHEN** the user has scrolled through a wave's photos (pagination has loaded additional pages)
- **WHEN** a refresh triggers `initialPhotos` to change
- **THEN** WavePhotoStrip SHALL reset to the fresh `initialPhotos` data
- **AND** pagination state SHALL reset (new batch UUID, page 0)
- **AND** the user CAN continue paginating from the refreshed state

### Requirement: WavePhotoStrip pagination resets with photo data
When `initialPhotos` changes, WavePhotoStrip SHALL also reset its pagination metadata to prevent stale state from blocking subsequent paginated fetches.

#### Scenario: Pagination metadata resets on refresh
- **WHEN** the user has scrolled through a wave's photos (pagination has loaded pages 0, 1, 2)
- **AND** pageNumber = 2, noMoreData = false, stopLoading.current = false
- **WHEN** a refresh triggers `initialPhotos` to change
- **THEN** WavePhotoStrip SHALL reset pageNumber to -1
- **THEN** WavePhotoStrip SHALL reset noMoreData to false
- **THEN** WavePhotoStrip SHALL reset stopLoading.current to false
- **THEN** the user SHALL be able to scroll right to load more photos starting from page 0

#### Scenario: handleLoadMore does not return early after refresh
- **WHEN** initialPhotos has just been reset by the useEffect
- **THEN** noMoreData SHALL be false
- **THEN** stopLoading.current SHALL be false
- **THEN** handleLoadMore SHALL NOT return early due to these guards
- **THEN** onEndReached SHALL successfully trigger a fetch for page 0

### Requirement: Badge counts refresh on upload completion
WavesHub SHALL subscribe to the upload bus and call `fetchCounts()` when a wave-specific upload completes (when `waveUuid` is present in the event). This ensures badge counts update in real-time without requiring the user to navigate away and back.

#### Scenario: Badge counts refresh after photo uploaded to wave
- **WHEN** a photo is uploaded from WaveDetail with a `waveUuid` and the upload completes
- **AND** the upload bus emits `{ photo, waveUuid: "abc-123" }`
- **THEN** WavesHub SHALL call `fetchCounts()` to refresh the ungrouped and wave count badges

#### Scenario: Badge counts NOT refreshed for main feed upload
- **WHEN** a photo is uploaded from the main feed (no `waveUuid`) and the upload completes
- **THEN** WavesHub SHALL NOT call `fetchCounts()` (handled by `autoGroupDone` mechanism)

#### Scenario: Subscription cleanup on unmount
- **WHEN** the WavesHub component unmounts
- **THEN** the upload bus listener SHALL be unsubscribed to prevent memory leaks

### Requirement: WaveDetail standardized on usePendingAnimation hook
WaveDetail SHALL use the `usePendingAnimation` hook instead of inline `useRef` for `pendingPhotosAnimation` and `uploadIconAnimation` values, ensuring consistent animation behavior with PhotosList and WavesHub.

#### Scenario: WaveDetail uses usePendingAnimation hook
- **WHEN** the WaveDetail screen renders
- **THEN** it SHALL call `usePendingAnimation({ pendingPhotosCount: pendingPhotos.length, netAvailable })` instead of inline `useRef(new Animated.Value(...))`
- **THEN** it SHALL pass the hook's `pendingPhotosAnimation` and `uploadIconAnimation` to `PendingPhotosBanner`

#### Scenario: WaveDetail animations behave identically to PhotosList
- **WHEN** pending photos are added (upload starts)
- **THEN** WaveDetail SHALL animate the banner in with a spring effect (same tension/friction as PhotosList)
- **WHEN** pending photos are cleared or uploaded
- **THEN** WaveDetail SHALL animate the banner out with a timing animation (300ms duration)

### Requirement: Auto-group completion triggers full waves list reload
When auto-grouping completes, WavesHub SHALL call `handleRefresh()` to perform a full waves list reload from the backend, ensuring newly created waves, updated photo thumbnails, and corrected counts are immediately visible.

#### Scenario: Auto-group completion reloads waves list
- **WHEN** `subscribeToAutoGroupDone` emits a completion event
- **THEN** WavesHub SHALL call `handleRefresh()` (same function used by pull-to-refresh and focus)
- **THEN** the system SHALL reset pagination, generate a new batch UUID, and call `loadWaves(page=0)`
- **THEN** the waves list SHALL display fresh data including newly grouped waves and updated thumbnails

### Requirement: Photo upload completion triggers full waves list reload
When a photo finishes uploading — whether to a specific wave or to the ungrouped pool — WavesHub SHALL call `handleRefresh()` to reload the full waves list, ensuring the uploaded photo appears in the correct location (within a wave or as an ungrouped photo).

#### Scenario: Upload to wave completes and reloads list
- **WHEN** `subscribeToUploadComplete` emits an event with `waveUuid != null`
- **THEN** WavesHub SHALL call `handleRefresh()`
- **THEN** the waves list SHALL show the photo in the correct wave's thumbnail strip

#### Scenario: Upload without wave completes and reloads list
- **WHEN** `subscribeToUploadComplete` emits an event with `waveUuid == null` (ungrouped photo)
- **THEN** WavesHub SHALL call `handleRefresh()`
- **THEN** the ungrouped photos count SHALL update and the ungrouped photo card SHALL show the new photo

