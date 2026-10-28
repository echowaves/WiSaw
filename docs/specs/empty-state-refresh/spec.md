## Purpose
TBD

## Requirements

### Requirement: Pull-to-refresh on empty state
All screens that show an empty state when no content is loaded SHALL support pull-to-refresh to reload data. The `ScrollView` wrapping the empty state card SHALL include a `RefreshControl` component that uses the screen's existing `reload` or `handleRefresh` function. A `refreshing` indicator SHALL be shown during the reload.

#### Scenario: User pulls down on global photos empty state
- **WHEN** the global photos feed returns zero results
- **THEN** the empty state `ScrollView` SHALL render a `RefreshControl`
- **THEN** when the user pulls down, `reload()` SHALL be called
- **THEN** the `RefreshControl` SHALL show a spinner while `loading` is true

#### Scenario: User pulls down on friend detail empty state
- **WHEN** a friend's photo feed returns zero photos
- **THEN** the empty state SHALL be wrapped in a `ScrollView` with a `RefreshControl`
- **THEN** when the user pulls down, `handleRefresh()` SHALL be called
- **THEN** a spinner SHALL be shown while `loading` is true

### Requirement: Accurate action button labels on empty states
Action buttons on empty state cards SHALL be labeled to accurately describe their effect. A button that calls `reload()` SHALL be labeled "Refresh" (not "Take a Photo" or any other label that implies navigation).

#### Scenario: Global photos empty state button label
- **WHEN** the global photos feed returns zero results
- **THEN** the primary action button SHALL be labeled "Refresh"
- **THEN** tapping "Refresh" SHALL call `reload()`

#### Scenario: Secondary camera CTA on global photos empty state
- **WHEN** the global photos feed returns zero results
- **THEN** a secondary button labeled "Take a Photo" SHALL be present
- **THEN** tapping "Take a Photo" SHALL invoke the camera open handler

### Requirement: Refresh action on friend detail empty state
When a friend's photo feed is empty, the empty state card SHALL include a "Refresh" action button in addition to pull-to-refresh support.

#### Scenario: Friend detail empty state has refresh button
- **WHEN** a friend has no shared photos
- **THEN** the empty state card SHALL display a "Refresh" button
- **THEN** tapping "Refresh" SHALL call `handleRefresh()`
