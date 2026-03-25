## MODIFIED Requirements

### Requirement: MergeWaveModal provides search and filtering
The MergeWaveModal SHALL display a searchable, paginated list of target wave candidates, excluding the source wave.

#### Scenario: Modal displays waves excluding source
- **WHEN** the MergeWaveModal opens for source wave X
- **THEN** the list SHALL include all user waves except wave X (page 0 fetched initially)
- **THEN** each wave item SHALL display the wave name and photo count

#### Scenario: User scrolls to load more waves
- **WHEN** the user scrolls near the bottom of the wave list
- **THEN** the system SHALL fetch the next page of waves via `listWaves` with incremented `pageNumber` and the same `batch`
- **THEN** new waves SHALL be appended to the existing list (still excluding the source wave)
- **THEN** a loading indicator SHALL be shown at the bottom while fetching

#### Scenario: All waves loaded
- **WHEN** the API returns `noMoreData: true`
- **THEN** the system SHALL stop requesting additional pages on scroll

#### Scenario: User searches for a target wave
- **WHEN** the user types into the search field
- **THEN** after a 300ms debounce, the system SHALL call `listWaves` with the `searchTerm` parameter
- **THEN** pagination SHALL reset to page 0 with a new batch UUID
- **THEN** the wave list SHALL be replaced with server-filtered results (still excluding source wave)

#### Scenario: No matching waves
- **WHEN** the search returns zero results
- **THEN** the modal SHALL display a "No waves found" empty state
