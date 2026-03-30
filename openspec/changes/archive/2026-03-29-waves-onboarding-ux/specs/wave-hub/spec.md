## ADDED Requirements

### Requirement: Waves empty state uses explainer view
The WavesHub component SHALL render the `WavesExplainerView` component instead of the current `EmptyStateCard` when the waves list is empty and no search term is active. The explainer variant SHALL be determined by the `ungroupedPhotosCount` atom value.

#### Scenario: Empty waves list with no search
- **WHEN** the waves list has zero items and `searchText` is empty
- **THEN** WavesHub SHALL render `WavesExplainerView` with the current `ungroupedPhotosCount` value and appropriate callbacks
- **THEN** the existing `EmptyStateCard` with "No Waves Yet" SHALL NOT be rendered

#### Scenario: Empty search results
- **WHEN** the waves list has zero items and `searchText` is non-empty
- **THEN** WavesHub SHALL continue to render the existing `EmptyStateCard` with "No waves found" and "Clear Search" action
- **THEN** `WavesExplainerView` SHALL NOT be rendered

### Requirement: Waves screen syncs global atoms on focus
The waves index screen SHALL write fetched counts to the global `wavesCount` and `ungroupedPhotosCount` atoms on focus, replacing the local `useState` for ungrouped count.

#### Scenario: Waves screen gains focus
- **WHEN** the waves index screen gains focus
- **THEN** it SHALL fetch `getUngroupedPhotosCount({ uuid })` and `getWavesCount({ uuid })`
- **THEN** it SHALL write the results to the global `ungroupedPhotosCount` and `wavesCount` atoms
- **THEN** it SHALL NOT maintain a separate local `useState` for ungrouped count

### Requirement: WavesHub updates wavesCount atom on wave mutations
WavesHub SHALL update the global `wavesCount` atom when waves are created, deleted, or auto-grouped, keeping the atom in sync with local state changes.

#### Scenario: Wave created via modal
- **WHEN** `handleCreateWave` succeeds and prepends the new wave to the local list
- **THEN** the `wavesCount` atom SHALL be incremented by 1

#### Scenario: Wave deleted via context menu
- **WHEN** `handleDeleteWave` succeeds and removes the wave from the local list
- **THEN** the `wavesCount` atom SHALL be decremented by 1
- **THEN** the `ungroupedPhotosCount` atom SHALL be incremented by the deleted wave's `photosCount`

#### Scenario: Auto-group creates waves
- **WHEN** the auto-group process completes with `totalWavesCreated` waves created
- **THEN** the `wavesCount` atom SHALL be incremented by `totalWavesCreated`
- **THEN** the `ungroupedPhotosCount` atom SHALL be set to 0
