## MODIFIED Requirements

### Requirement: Location-Based Feed Filtering
The system SHALL filter the Global feed to show only photos taken near the user's current GPS location, reading coordinates from the global `locationAtom`. After auto-grouping, newly wave-assigned photos SHALL continue to appear in the Global feed as before; wave assignment does not remove photos from the location-based feed. The feed query SHALL NOT accept a wave filtering parameter. The feed SHALL show appropriate UI states while location is pending or denied.

#### Scenario: User has location permission granted
- **WHEN** `locationAtom.status` is `ready` and the feed is fetched
- **THEN** only photos within the configured proximity radius are displayed
- **THEN** the `feedForWatcher` query is called with coordinates from `locationAtom.coords`

#### Scenario: Location is pending
- **WHEN** `locationAtom.status` is `pending`
- **THEN** the feed SHALL display a banner at the top: "Obtaining your location..."
- **THEN** the feed content area SHALL show an empty state card with message "We're finding your location so we can show nearby photos"
- **THEN** the feed SHALL NOT call the geo query (no coordinates available)
- **THEN** when the atom transitions to `ready`, the feed SHALL automatically load

#### Scenario: Location permission denied
- **WHEN** `locationAtom.status` is `denied`
- **THEN** the feed SHALL display a banner: "Location access needed" with a "Settings" link
- **THEN** the feed content area SHALL show an empty state card with message explaining location is required and a button to open Settings
- **THEN** the feed SHALL NOT call the geo query

#### Scenario: Photos remain in feed after auto-grouping
- **WHEN** photos are assigned to waves via auto-grouping
- **THEN** those photos SHALL still appear in the Global feed based on location proximity

#### Scenario: Location updates trigger feed refresh
- **WHEN** the `locationAtom` coords change (user moved 100m+)
- **THEN** the feed SHALL reload with the new coordinates

### Requirement: PhotosList search bar keyboard handling
The PhotosList search bar SHALL use `KeyboardStickyView` from `react-native-keyboard-controller` with a negative `closed` offset so the search bar is visible above the footer when the keyboard is closed. The `closed` offset SHALL be `-(FOOTER_HEIGHT + FOOTER_GAP)` (currently `-94`) to translate the search bar upward from its natural document-flow position, clearing the absolute-positioned footer. The `opened` offset SHALL remain `KEYBOARD_GAP` (`16`). In the results render branch (`photosList.length > 0`), both the `PhotosListSearchBar` and `PhotosListFooter` SHALL be rendered at the outer View level (outside `<View style={styles.container}>`), matching their placement in the default/empty-state branches.

#### Scenario: Search bar visible when keyboard is closed
- **WHEN** the search segment is active (`activeSegment === 2`) and the keyboard is closed
- **THEN** the search bar SHALL be visible on screen, positioned above the footer
- **THEN** the `KeyboardStickyView` `closed` offset SHALL be `-(FOOTER_HEIGHT + FOOTER_GAP)` to translate the bar upward from its natural position

#### Scenario: Search bar stays above keyboard
- **WHEN** a user taps the search bar in the photos list
- **THEN** the search bar SHALL remain positioned directly above the keyboard

#### Scenario: Search bar returns to position above footer
- **WHEN** the keyboard is dismissed
- **THEN** the search bar SHALL return to its position above the footer

#### Scenario: Search results render without gap
- **WHEN** search results are displayed (`photosList.length > 0` and `activeSegment === 2`)
- **THEN** the `PhotosListSearchBar` and `PhotosListFooter` SHALL be rendered as siblings at the outer `<View style={{ flex: 1 }}>` level, outside `<View style={styles.container}>`
- **THEN** the masonry grid SHALL start immediately below the header with no empty gap

#### Scenario: Empty search results show search bar
- **WHEN** a search returns zero results (`photosList.length === 0` and `activeSegment === 2`)
- **THEN** the search bar SHALL remain visible with the same positioning as the non-empty results state

## REMOVED Requirements

### Requirement: Drawer menu button badge for upload target wave
**Reason**: The upload target concept is being removed entirely. The nav menu button no longer needs to indicate upload target status.
**Migration**: No migration needed. The nav menu button becomes a plain drawer opener.
