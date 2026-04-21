## MODIFIED Requirements

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
- **THEN** the feed content area SHALL show an empty state card with title "Location Access Needed" and a message explaining location is required
- **THEN** the card SHALL include a primary action button labeled "Enable Location" that opens device Settings
- **THEN** the card SHALL include a secondary action button labeled "Cancel"
- **THEN** the feed SHALL NOT call the geo query

#### Scenario: Location denied and user dismisses empty state
- **WHEN** `locationAtom.status` is `denied` and the user taps "Cancel" on the empty state card
- **THEN** the empty state card SHALL transition to a neutral state with the `location-off` icon
- **THEN** the card SHALL display the message "Unable to show nearby photos without location access"
- **THEN** the card SHALL NOT display any action buttons
- **THEN** the dismissed state SHALL be local to the component (resets on remount)

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

#### Scenario: Empty state supports pull-to-refresh
- **WHEN** the global photos feed returns zero results
- **THEN** the empty state `ScrollView` SHALL include a `RefreshControl` wired to `reload()`
- **THEN** the primary action button SHALL be labeled "Refresh"
- **THEN** a secondary button labeled "Take a Photo" SHALL be present to open the camera
