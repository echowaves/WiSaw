## MODIFIED Requirements

### Requirement: Wave Card Context Menu
The system SHALL show an `ActionMenu` modal on long-press of a wave card with icon + label management options.

#### Scenario: Owner long-presses their own wave card
- **WHEN** the wave owner long-presses a wave card
- **THEN** an `ActionMenu` modal SHALL display with items:
  - `pencil-alt` icon: "Edit Wave"
  - `call-merge` icon: "Merge Into Another Wave..."
  - separator
  - `trash-can-outline` icon: "Delete Wave" (destructive)

#### Scenario: User deletes a wave from context menu
- **WHEN** the user selects Delete Wave from the ActionMenu
- **THEN** a confirmation dialog is shown
- **THEN** upon confirmation, the wave is deleted and removed from the grid
- **THEN** the system SHALL emit `autoGroupDone` to trigger an ungrouped-photos count refresh

#### Scenario: Post-merge list update
- **WHEN** a merge completes successfully from WavesHub
- **THEN** the source wave SHALL be removed from the waves list
- **THEN** the target wave's `photosCount` SHALL be updated to reflect the merged total
- **THEN** a success toast SHALL be shown

### Requirement: WavesHub Search Uses Server-Side Query
The WavesHub search bar SHALL send the search term to the backend via the `listWaves` `searchTerm` parameter instead of filtering client-side.

#### Scenario: User types in WavesHub search bar
- **WHEN** the user types in the WavesHub search input
- **THEN** after a 300ms debounce, the system SHALL call `listWaves` with the `searchTerm` parameter, `pageNumber: 0`, and a new `batch` UUID
- **THEN** the waves list SHALL be replaced with the server-filtered results
- **THEN** the current sort order (`sortBy`, `sortDirection`) SHALL be preserved in the query

#### Scenario: User clears WavesHub search
- **WHEN** the user clears the search input
- **THEN** after the 300ms debounce, the system SHALL fetch all waves from page 0 with no `searchTerm`
- **THEN** infinite scroll SHALL continue to work for the unfiltered results

#### Scenario: User scrolls while search is active
- **WHEN** a search term is active and the user scrolls to the bottom
- **THEN** the system SHALL fetch the next page with the same `searchTerm` and `batch`
- **THEN** results SHALL be appended to the existing filtered list
