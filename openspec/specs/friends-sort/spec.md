# Friends Sort Specification

## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for friends list sort in WiSaw.

## Requirements

### Requirement: Friends list sort options
The friends screen SHALL provide sort options accessible via a header button that opens a SortOrderPicker in arrows mode. Available sort options SHALL be: Alphabetical A-Z and Recently Added.

#### Scenario: User selects A-Z sort
- **WHEN** the user opens the SortOrderPicker and selects A-Z
- **THEN** the friends list SHALL reorder confirmed friends alphabetically A-Z (ascending)
- **THEN** the A-Z option SHALL display an up arrow (▲) indicating ascending order

#### Scenario: User toggles A-Z to Z-A
- **WHEN** the user taps the A-Z option while ascending is active
- **THEN** the friends list SHALL reorder confirmed friends alphabetically Z-A (descending)
- **THEN** the A-Z option SHALL display a down arrow (▼) indicating descending order

#### Scenario: User selects Recent sort
- **WHEN** the user opens the SortOrderPicker and selects Recent
- **THEN** the friends list SHALL reorder confirmed friends by `updatedAt` newest first
- **THEN** the Recent option SHALL display an up arrow (▲) indicating newest-first

#### Scenario: User toggles Recent direction
- **WHEN** the user taps the Recent option while newest-first is active
- **THEN** the friends list SHALL reorder confirmed friends by `updatedAt` oldest first
- **THEN** the Recent option SHALL display a down arrow (▼) indicating oldest-first

#### Scenario: Default sort order
- **WHEN** the user has not changed the sort in the current session
- **THEN** the friends list SHALL default to A-Z sort with ascending direction (▲)

#### Scenario: Sort state resets on app restart
- **WHEN** the app restarts
- **THEN** the sort selection SHALL reset to the default (A-Z, ascending)

#### Scenario: Sort uses updatedAt field
- **WHEN** the Recent sort option is active
- **THEN** the friends list SHALL be sorted by the `updatedAt` field, not `createdAt`

### Requirement: Friends sort state management
Sort state SHALL be managed via Jotai atoms (`friendsSortBy` and `friendsSortDirection`), following the same pattern as waves sort state.

#### Scenario: Sort state stored in Jotai atoms
- **WHEN** the user changes the sort option
- **THEN** the `friendsSortBy` and `friendsSortDirection` Jotai atoms SHALL update
- **THEN** the FriendsList component SHALL re-render with the new sort order

#### Scenario: friendsSortBy atom values
- **WHEN** the user selects A-Z sort
- **THEN** `friendsSortBy` SHALL be `'alphabetical'`
- **WHEN** the user selects Recent sort
- **THEN** `friendsSortBy` SHALL be `'updatedAt'`