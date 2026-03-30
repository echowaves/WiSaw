## Requirements

### Requirement: Location-Based Feed Filtering
The system SHALL filter the Global feed to show only photos taken near the user's current GPS location, reading coordinates from the global `locationAtom`. After auto-grouping, newly wave-assigned photos SHALL continue to appear in the Global feed as before; wave assignment does not remove photos from the location-based feed. The feed query SHALL NOT accept a wave filtering parameter. The feed SHALL show appropriate UI states while location is pending or denied. The feed SHALL NOT automatically reload when coordinates change; instead, the user SHALL be notified via a drift banner and must manually trigger a reload.

#### Scenario: User has location permission granted
- **WHEN** `locationAtom.status` is `ready` and the feed is fetched
- **THEN** only photos within the configured proximity radius are displayed
- **THEN** the `feedByDate` query is called with coordinates from `locationAtom.coords`

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

#### Scenario: Feed data flow uses explicit parameters
- **WHEN** `load()` is called from `reload()`, `submitSearch()`, `handleClearSearch()`, or `handleLoadMore()`
- **THEN** `load()` SHALL be called via `useFeedLoader` which accepts explicit override parameters to prevent stale React state closures
- **THEN** `reload()` SHALL always pass page 0 explicitly
- **THEN** `handleLoadMore()` SHALL compute the new page and pass it explicitly
- **THEN** search interactions SHALL delegate to `useFeedSearch` which calls `reload()` with the appropriate search term

#### Scenario: Photos remain in feed after auto-grouping
- **WHEN** photos are assigned to waves via auto-grouping
- **THEN** those photos SHALL still appear in the Global feed based on location proximity

#### Scenario: Location drift shows banner instead of auto-reload
- **WHEN** the `locationAtom` coords change during normal use
- **THEN** the feed SHALL NOT automatically reload
- **THEN** if the drift between `feedLocationRef` and live coords exceeds 500 meters, a `LocationDriftBanner` SHALL be shown
- **THEN** the user SHALL manually trigger a reload to update the feed

#### Scenario: Feed reload snapshots location
- **WHEN** the feed reloads via any trigger (pull-to-refresh, banner tap, initial load, network reconnect)
- **THEN** `feedLocationRef.current` SHALL be set to the current `locationAtom.coords`
- **THEN** the feed query SHALL use the current `locationAtom.coords`

### ~~Requirement: PhotosList search bar keyboard handling~~
**REMOVED**: Replaced by the SearchFab component which uses absolute positioning and `useReanimatedKeyboardAnimation` instead of `KeyboardStickyView`. The search segment (segment 2) no longer exists. Search input is now handled by `SearchFab` (see `search-fab` capability).

### Requirement: Photo feed state management
The PhotosList screen SHALL use `useFeedLoader` hook for photo array state management instead of inline `useState` and manual event subscriptions. The hook SHALL handle photo freezing, deduplication, pagination, abort control, upload subscriptions, and deletion subscriptions. Upload state (`pendingPhotos`, `isUploading`, `enqueueCapture`, `clearPendingQueue`) SHALL be consumed from `UploadContext`. The screen SHALL provide a `PhotosListContext` with the `removePhoto` function returned by `useFeedLoader`.

#### Scenario: PhotosList uses useFeedLoader
- **WHEN** the PhotosList screen mounts
- **THEN** it SHALL initialize `useFeedLoader` with `fetchFn: requestGeoPhotos` and `subscribeToUploads: true`
- **THEN** the photo list, loading state, pagination, and event subscriptions SHALL be managed by the hook

#### Scenario: Upload state consumed from context
- **WHEN** PhotosList needs `pendingPhotos`, `isUploading`, `enqueueCapture`, or `clearPendingQueue`
- **THEN** it SHALL consume them from `UploadContext` via `useContext`

#### Scenario: Photo deletion handled by hook
- **WHEN** a `photoDeletionBus` event is emitted
- **THEN** `useFeedLoader` SHALL remove the matching photo from the list
- **THEN** no additional deletion subscription SHALL exist in PhotosList

### Requirement: Photo feed reloads on identity change
The PhotosList screen SHALL subscribe to identity-change events and reload the feed when the user's identity is established, updated, or reset. The reload SHALL call the `reload` function returned by `useFeedLoader`.

#### Scenario: Identity change triggers reload
- **WHEN** the user registers an identity and `emitIdentityChange()` fires
- **THEN** PhotosList SHALL call `useFeedLoader.reload()` to refetch the feed

#### Scenario: Identity changed while PhotosList is unmounted
- **WHEN** `emitIdentityChange()` fires but the PhotosList component is not mounted
- **THEN** no reload SHALL occur (the subscription is cleaned up on unmount)

#### Scenario: Subscription cleanup on unmount
- **WHEN** the PhotosList component unmounts
- **THEN** the identity-change listener SHALL be unsubscribed

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

### Requirement: Masonry component tracks scroll direction for FOB
The `PhotosListMasonry` component SHALL internally track scroll direction by comparing consecutive `contentOffset.y` values. It SHALL maintain a `prevScrollY` ref and a `showFob` state. The existing `onScroll` callback from the parent SHALL continue to be forwarded without modification.

#### Scenario: Scroll event drives FOB visibility
- **WHEN** a scroll event fires in `PhotosListMasonry`
- **THEN** the component SHALL first evaluate FOB visibility based on current offset and scroll direction
- **THEN** the component SHALL forward the event to the parent's `onScroll` callback unchanged

#### Scenario: Masonry wraps content for FOB overlay
- **WHEN** `PhotosListMasonry` renders
- **THEN** it SHALL wrap `ExpoMasonryLayout` in a `<View style={{ flex: 1 }}>` container
- **THEN** the `ScrollToTopFob` SHALL render as an absolutely-positioned sibling within that container
- **THEN** the existing masonry layout behavior SHALL be unaffected

### Requirement: Masonry manages FOB inactivity timer
The `PhotosListMasonry` component SHALL manage a 3-second inactivity timer via a ref. Each qualifying scroll event (downward, past 200px) SHALL clear and restart the timer. When the timer fires, `showFob` SHALL be set to false. The timer SHALL be cleared on component unmount.

#### Scenario: Timer cleanup on unmount
- **WHEN** the `PhotosListMasonry` component unmounts
- **THEN** the inactivity timer SHALL be cleared to prevent state updates on an unmounted component
