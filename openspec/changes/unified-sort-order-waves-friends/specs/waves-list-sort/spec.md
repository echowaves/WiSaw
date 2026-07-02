## MODIFIED Requirements

### Requirement: Waves List Sort Options
The waves screen SHALL provide sort options accessible via a header button that opens a SortOrderPicker in arrows mode. Available sort options SHALL be: Alphabetical A-Z and Recently Added.

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
- **THEN** the waves list SHALL reorder by `updatedAt` newest first
- **THEN** the Recent option SHALL display an up arrow (▲) indicating newest-first

#### Scenario: User toggles Recent direction
- **WHEN** the user taps the Recent option while newest-first is active
- **THEN** the waves list SHALL reorder by `updatedAt` oldest first
- **THEN** the Recent option SHALL display a down arrow (▼) indicating oldest-first

#### Scenario: Default sort order
- **WHEN** the user has not changed the sort in the current session
- **THEN** the waves list SHALL default to A-Z sort with ascending direction (▲)

#### Scenario: Sort state resets on app restart
- **WHEN** the app restarts
- **THEN** the sort selection SHALL reset to the default (A-Z, ascending)

#### Scenario: Sort uses updatedAt field for Recent
- **WHEN** the Recent sort option is active
- **THEN** the waves list SHALL be sorted by the `updatedAt` field

#### Scenario: A-Z sorts by wave name
- **WHEN** the A-Z sort option is active
- **THEN** the waves list SHALL be sorted alphabetically by the wave `name` field

#### Scenario: Sort is applied client-side
- **WHEN** sort options are changed
- **THEN** the sort SHALL be applied client-side to the already-fetched waves list
- **THEN** no additional server queries SHALL be made for name-based sorting

### Requirement: Waves List Sort State
The system SHALL maintain session-only sort state for the waves list with `sortBy` (either `"name"` or `"updatedAt"`) and `sortDirection` (either `"asc"` or `"desc"`). The default sort SHALL be `name` / `asc`.

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