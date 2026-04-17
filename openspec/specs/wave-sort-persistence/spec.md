## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for wave sort persistence in WiSaw.

## Requirements

### Requirement: Wave sort preferences persist across app restarts
The system SHALL save the user's wave list sort preferences (sortBy and sortDirection) to device storage whenever the user changes them, and SHALL restore those preferences when the app starts.

#### Scenario: User changes sort order and restarts app
- **WHEN** user selects "Created, Oldest First" sort option on the Waves screen and restarts the app
- **THEN** the Waves screen SHALL display waves sorted by `createdAt` ascending on initial landing

#### Scenario: First-time user with no stored preference
- **WHEN** user has never changed the sort order (no stored preference exists)
- **THEN** the Waves screen SHALL default to sorting by `updatedAt` descending

#### Scenario: Storage read fails
- **WHEN** the device storage read fails
- **THEN** the system SHALL fall back to the default sort (`updatedAt` descending) without blocking app startup

### Requirement: Sort state is managed via global atoms
The system SHALL manage wave sort state (`waveSortBy`, `waveSortDirection`) as jotai atoms rather than component-local `useState`, so that any component can read the current sort preference.

#### Scenario: Atoms hydrated at app startup
- **WHEN** the app initializes
- **THEN** the `waveSortBy` and `waveSortDirection` atoms SHALL be populated from stored preferences before navigation is available

#### Scenario: Sort change updates atom and persists
- **WHEN** user selects a new sort option from the Waves screen menu
- **THEN** the corresponding jotai atoms SHALL update immediately AND the new values SHALL be written to device storage

### Requirement: Single data-fetching effect with correct dependencies
The WavesHub component SHALL use a single `useFocusEffect` to trigger data fetches, with dependencies that include the sort values, eliminating duplicate fetches and stale closure risk.

#### Scenario: Sort changed while Waves screen is focused
- **WHEN** user changes sort order while viewing the Waves screen
- **THEN** the wave list SHALL re-fetch exactly once with the new sort parameters

#### Scenario: Returning to Waves screen from another screen
- **WHEN** user navigates away from Waves and returns
- **THEN** the wave list SHALL re-fetch using the current sort atom values (not stale defaults)
