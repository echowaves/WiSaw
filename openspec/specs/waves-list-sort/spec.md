> **RETIRED** — Sort options removed in change `remove-sort-selector-waves-friends`. Sort is now fixed to `createdAt` desc with no user-selectable options.
>
> ## Purpose
> This specification defines expected user-visible behavior, constraints, and validation scenarios for waves list sort in WiSaw.

## Requirements

### Requirement: Waves List Sort Options
The waves screen SHALL provide sort options accessible via a header button that opens a SortOrderPicker in arrows mode. Available sort options SHALL be: Alphabetical A-Z and Recent (by most recent photo).

#### Scenario: User selects A-Z sort
- **WHEN** the user opens the SortOrderPicker and selects A-Z
- **THEN** the waves list SHALL reorder alphabetically by wave name A-Z (ascending)
- **THEN** the A-Z option SHALL display an up arrow (▲) indicating ascending order

#### Scenario: User toggles A-Z to Z-A
- **WHEN** the user taps the A-Z option while ascending is active
- **THEN** the waves list SHALL reorder alphabetically by wave name Z-A (descending)
- **THEN** the A-Z option SHALL display a down arrow (▼) indicating descending order

#### Scenario: User selects Recent sort
- **WHEN** the user opens the SortOrderPicker and selects Recent
- **THEN** the waves list SHALL reorder by most recent photo date, newest first
- **THEN** the Recent option SHALL display an up arrow (▲) indicating newest-first

#### Scenario: User toggles Recent direction
- **WHEN** the user taps the Recent option while newest-first is active
- **THEN** the waves list SHALL reorder by most recent photo date, oldest first
- **THEN** the Recent option SHALL display a down arrow (▼) indicating oldest-first

#### Scenario: Default sort order
- **WHEN** the user has not changed the sort in the current session
- **THEN** the waves list SHALL default to A-Z sort with ascending direction (▲)

#### Scenario: Sort state resets on app restart
- **WHEN** the app restarts
- **THEN** the sort selection SHALL reset to the default (A-Z, ascending)

#### Scenario: Recent sort uses most recent photo
- **WHEN** the Recent sort option is active
- **THEN** the waves list SHALL be sorted by the most recent photo's `updatedAt` timestamp within each wave
- **THEN** waves without any photos SHALL appear at the end of the sorted list

#### Scenario: A-Z sorts by wave name
- **WHEN** the A-Z sort option is active
- **THEN** the waves list SHALL be sorted alphabetically by the wave `name` field

### Requirement: Waves List Sort State
The system SHALL maintain session-only sort state for the waves list with `sortBy` (either `"name"` or `"recentPhoto"`) and `sortDirection` (either `"asc"` or `"desc"`). The default sort SHALL be `name` / `asc`.

#### Scenario: Default sort on initial load
- **WHEN** the Waves screen loads for the first time in a session
- **THEN** the waves list SHALL be sorted by `name` in `asc` order

#### Scenario: Sort state resets on app restart
- **WHEN** the app is restarted
- **THEN** the sort state SHALL reset to `name` / `asc`

### Requirement: Removed createdAt Sort
The system SHALL no longer support `createdAt` as a sort option for the waves list.

#### Scenario: createdAt sort option not available
- **WHEN** the user views the sort options in the SortOrderPicker
- **THEN** a "Created" or "createdAt" sort option SHALL NOT be displayed

#### Scenario: listWaves not called with createdAt
- **WHEN** `loadWaves` is called
- **THEN** the `listWaves` GraphQL query SHALL NOT include `sortBy: "createdAt"`

### Requirement: Sort Change Triggers Full Refresh
The system SHALL reset pagination and re-fetch the waves list from page 0 when the user changes the sort order.

#### Scenario: User changes sort order
- **WHEN** the user selects a different sort option from the SortOrderPicker
- **THEN** the system SHALL reset pagination to page 0 with a new batch UUID
- **THEN** the system SHALL call `loadWaves` with the new sort parameters

#### Scenario: User selects the already-active sort option
- **WHEN** the user selects the sort option that is already active
- **THEN** no refresh SHALL be triggered

### Requirement: listWaves Uses Backend recentPhoto Sort for Recent
When `sortBy` is `"recentPhoto"`, the `listWaves` GraphQL query SHALL pass `sortBy: "recentPhoto"` to the backend, which uses a subquery to sort by the most recent photo's `updatedAt` timestamp.

#### Scenario: listWaves called with recentPhoto sort
- **WHEN** the user selects Recent sort
- **THEN** the `listWaves` GraphQL query SHALL include `sortBy: "recentPhoto"` and `sortDirection`
- **THEN** the backend SHALL return waves ordered by most recent photo date

#### Scenario: listWaves called with name sort
- **WHEN** the user selects A-Z sort
- **THEN** the `listWaves` GraphQL query SHALL include `sortBy: "name"` and `sortDirection`
- **THEN** the backend SHALL return waves ordered alphabetically by name