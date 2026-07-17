## Purpose
This specification defines the feed mode toggle FAB that switches between geo feed and bookmarks feed on the landing screen. It replaces the standalone Bookmarks screen with an in-place toggle, keeping the layout identical while switching the data source.

## Requirements

### Requirement: Feed mode toggle FAB renders on landing screen
The system SHALL render a circular FAB (56x56px) on the landing screen, positioned on the right side above the Search FAB. The FAB SHALL display a `globe-outline` icon (Ionicons) when in geo feed mode (default) and a `bookmark-outline` icon (Ionicons) when in bookmarks mode. The FAB SHALL use `theme.INTERACTIVE_PRIMARY` as its background color and `white` as its icon color.

#### Scenario: FAB visible in geo feed mode
- **WHEN** the landing screen renders with `isBookmarksMode` equal to `false`
- **THEN** a FAB SHALL be visible on the right side of the screen
- **THEN** the FAB SHALL display an Ionicons `globe-outline` icon
- **THEN** the FAB SHALL be positioned 16px from the right edge
- **THEN** the FAB SHALL be positioned `FOOTER_HEIGHT + 84` pixels from the bottom of the screen (above the Search FAB with 12px gap)

#### Scenario: FAB visible in bookmarks mode
- **WHEN** the landing screen renders with `isBookmarksMode` equal to `true`
- **THEN** the FAB SHALL display an Ionicons `bookmark-outline` icon
- **THEN** the FAB SHALL maintain the same position and size

#### Scenario: FAB hidden when no content context
- **WHEN** the network is unavailable or terms and conditions are not accepted
- **THEN** the FAB SHALL NOT be rendered

### Requirement: Toggle switches between feed modes
The system SHALL toggle `isBookmarksMode` Jotai atom when the FAB is tapped. The toggle SHALL trigger a feed reload with the appropriate data source. When switching to geo mode, the feed SHALL call `requestGeoPhotos` (activeSegment 0). When switching to bookmarks mode, the feed SHALL call `requestWatchedPhotos` (activeSegment 1). The layout SHALL remain identical — only the data source changes.

#### Scenario: User taps FAB to switch to bookmarks
- **WHEN** the user taps the FAB while in geo feed mode
- **THEN** `isBookmarksMode` SHALL be set to `true`
- **THEN** the FAB icon SHALL change from `globe-outline` to `bookmark-outline`
- **THEN** the feed SHALL reload using `requestWatchedPhotos` (activeSegment 1)
- **THEN** the masonry layout SHALL NOT change (same columns, same tile size, same comments)

#### Scenario: User taps FAB to switch to geo feed
- **WHEN** the user taps the FAB while in bookmarks mode
- **THEN** `isBookmarksMode` SHALL be set to `false`
- **THEN** the FAB icon SHALL change from `bookmark-outline` to `globe-outline`
- **THEN** the feed SHALL reload using `requestGeoPhotos` (activeSegment 0)
- **THEN** the masonry layout SHALL NOT change

#### Scenario: Haptic feedback on toggle
- **WHEN** the user taps the toggle FAB
- **THEN** a light haptic feedback SHALL be triggered via `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`

### Requirement: Bookmarks mode does not require location
The system SHALL load the bookmarks feed regardless of GPS location state. When in bookmarks mode, the feed SHALL use `feedForWatcher` which requires only the user's `uuid`. Location states (pending, denied, unavailable) SHALL NOT block the bookmarks feed from loading.

#### Scenario: Bookmarks mode with location denied
- **WHEN** the user toggles to bookmarks mode while `locationAtom.status` is `denied`
- **THEN** the bookmarks feed SHALL load normally
- **THEN** no location-related banners or empty states SHALL be shown for the bookmarks feed

#### Scenario: Geo mode still respects location
- **WHEN** the user toggles to geo mode (`isBookmarksMode = false`)
- **THEN** the feed SHALL respect location state as before (pending, denied, unavailable states)
- **THEN** location banners SHALL be shown when applicable

### Requirement: Search works in both feed modes
The system SHALL apply the current search term to the active feed source. When in geo mode, search filters `feedByDate`. When in bookmarks mode, search filters `feedForWatcher`. The Search FAB SHALL remain functional regardless of the toggle state.

#### Scenario: Search in bookmarks mode
- **WHEN** the user submits a search term while in bookmarks mode
- **THEN** `feedForWatcher` SHALL be called with the `searchTerm` parameter
- **THEN** only bookmarked photos matching the search term SHALL be displayed

#### Scenario: Toggle clears search state
- **WHEN** the user toggles between feed modes
- **THEN** the current search term SHALL be preserved
- **THEN** the search term SHALL be applied to the new feed source on reload

### Requirement: isBookmarksMode Jotai atom
The app SHALL expose an `isBookmarksMode` Jotai atom in `src/state.js` initialized to `false`. The atom SHALL be a simple boolean that PhotosList reads to determine the active data source.

#### Scenario: Atom defaults to geo feed
- **WHEN** the app launches
- **THEN** `isBookmarksMode` SHALL be `false`
- **THEN** the landing screen SHALL show the geo feed by default
