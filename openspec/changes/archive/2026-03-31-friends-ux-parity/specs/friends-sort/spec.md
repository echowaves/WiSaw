## ADDED Requirements

### Requirement: Friends list sort options
The friends screen SHALL provide sort options accessible via a header ActionMenu (⋮ button). Available sort options SHALL be: Alphabetical A-Z, Alphabetical Z-A, Recently Added, and Most Recent Chat.

#### Scenario: User selects a sort option
- **WHEN** the user opens the header ActionMenu and selects a sort option
- **THEN** the friends list SHALL reorder according to the selected sort
- **THEN** the selected sort option SHALL display a checkmark in the ActionMenu

#### Scenario: Default sort order
- **WHEN** the user has not selected a sort option in the current session
- **THEN** the friends list SHALL default to Recently Added sort (newest first)

#### Scenario: Sort state resets on app restart
- **WHEN** the app restarts
- **THEN** the sort selection SHALL reset to the default (Recently Added)

### Requirement: Pending friends pinned to top
Pending friends SHALL always appear at the top of the friends list as a group, regardless of the selected sort option. Only confirmed friends SHALL be affected by sort selection.

#### Scenario: Pending friends with alphabetical sort
- **WHEN** the user selects Alphabetical A-Z sort and has both pending and confirmed friends
- **THEN** all pending friends SHALL appear at the top of the list
- **THEN** confirmed friends SHALL appear below, sorted alphabetically A-Z

### Requirement: Friends sort state management
Sort state SHALL be managed via Jotai atoms (`friendsSortBy` and `friendsSortDirection`), following the same pattern as waves sort state.

#### Scenario: Sort state stored in Jotai atoms
- **WHEN** the user changes the sort option
- **THEN** the `friendsSortBy` and `friendsSortDirection` Jotai atoms SHALL update
- **THEN** the FriendsList component SHALL re-render with the new sort order
