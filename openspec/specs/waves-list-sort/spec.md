### Requirement: Waves List Sort State
The system SHALL maintain session-only sort state for the waves list with `sortBy` (either `"createdAt"` or `"updatedAt"`) and `sortDirection` (either `"asc"` or `"desc"`). The default sort SHALL be `updatedAt` / `desc`.

#### Scenario: Default sort on initial load
- **WHEN** the Waves screen loads for the first time in a session
- **THEN** the waves list SHALL be sorted by `updatedAt` in `desc` order

#### Scenario: Sort state resets on app restart
- **WHEN** the app is restarted
- **THEN** the sort state SHALL reset to `updatedAt` / `desc`

### Requirement: Sort Parameters in listWaves Query
The system SHALL pass `sortBy` and `sortDirection` parameters to the `listWaves` GraphQL query when sort state is set.

#### Scenario: listWaves called with sort parameters
- **WHEN** `loadWaves` is called with `sortBy` and `sortDirection` values
- **THEN** the `listWaves` GraphQL query SHALL include `sortBy` and `sortDirection` as variables
- **THEN** the backend SHALL return waves in the requested sort order

#### Scenario: listWaves called without sort parameters
- **WHEN** `listWaves` is called without `sortBy` or `sortDirection`
- **THEN** the query SHALL omit those variables and the backend SHALL use its default sort order

### Requirement: Sort Change Triggers Full Refresh
The system SHALL reset pagination and re-fetch the waves list from page 0 when the user changes the sort order.

#### Scenario: User changes sort order
- **WHEN** the user selects a different sort option from the kebab menu
- **THEN** the system SHALL reset pagination to page 0 with a new batch UUID
- **THEN** the system SHALL call `loadWaves` with the new sort parameters
- **THEN** the waves list SHALL be replaced with the freshly sorted results

#### Scenario: User selects the already-active sort option
- **WHEN** the user selects the sort option that is already active
- **THEN** no refresh SHALL be triggered
