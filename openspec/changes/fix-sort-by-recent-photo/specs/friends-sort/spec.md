## MODIFIED Requirements

### Requirement: Friends list sort options
The friends screen SHALL provide sort options accessible via a header button that opens a SortOrderPicker. Available sort options SHALL be: Alphabetical A-Z and Recently Added (by most recent photo).

#### Scenario: User selects a sort option
- **WHEN** the user opens the SortOrderPicker and selects a sort option
- **THEN** the friends list SHALL reorder according to the selected sort
- **THEN** the selected sort option SHALL display the appropriate directional indicator

#### Scenario: Default sort order
- **WHEN** the user has not selected a sort option in the current session
- **THEN** the friends list SHALL default to Alphabetical A-Z sort (ascending)

#### Scenario: Sort state resets on app restart
- **WHEN** the app restarts
- **THEN** the sort selection SHALL reset to the default (Alphabetical A-Z)

### Requirement: Friends "Recent" sort uses most recent photo
When the "Recent" sort option is active, confirmed friends SHALL be sorted by the timestamp of their most recently shared photo, with newest photos first. Friends without any shared photos SHALL appear at the end of the sorted list.

#### Scenario: Recent sort by most recent photo
- **WHEN** the user selects the "Recent" sort option
- **THEN** confirmed friends SHALL be ordered by the `updatedAt` of their most recent photo (descending)
- **THEN** friends with no shared photos SHALL appear after all friends with photos

#### Scenario: Recent sort excludes pending friends
- **WHEN** the user selects the "Recent" sort option and has pending friends
- **THEN** pending friends SHALL remain pinned at the top of the list
- **THEN** only confirmed friends SHALL be affected by the photo-based sort

### Requirement: Pending friends pinned to top
Pending friends SHALL always appear at the top of the friends list as a group, regardless of the selected sort option. Only confirmed friends SHALL be affected by sort selection.

#### Scenario: Pending friends with alphabetical sort
- **WHEN** the user selects Alphabetical A-Z sort and has both pending and confirmed friends
- **THEN** all pending friends SHALL appear at the top of the list
- **THEN** confirmed friends SHALL appear below, sorted alphabetically A-Z

#### Scenario: Pending friends with recent sort
- **WHEN** the user selects Recent sort and has both pending and confirmed friends
- **THEN** all pending friends SHALL appear at the top of the list
- **THEN** confirmed friends SHALL appear below, sorted by most recent photo date

### Requirement: Friends sort state management
Sort state SHALL be managed via Jotai atoms (`friendsSortBy` and `friendsSortDirection`), following the same pattern as waves sort state. The default `friendsSortBy` value SHALL be `"alphabetical"` with `friendsSortDirection` `"asc"`.

#### Scenario: Sort state stored in Jotai atoms
- **WHEN** the user changes the sort option
- **THEN** the `friendsSortBy` and `friendsSortDirection` Jotai atoms SHALL update
- **THEN** the FriendsList component SHALL re-render with the new sort order

#### Scenario: Default sort is alphabetical ascending
- **WHEN** the app starts for the first time in a session
- **THEN** `friendsSortBy` SHALL be `"alphabetical"` and `friendsSortDirection` SHALL be `"asc"`