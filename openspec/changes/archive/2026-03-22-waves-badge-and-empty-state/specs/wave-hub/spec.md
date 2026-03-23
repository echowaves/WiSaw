## MODIFIED Requirements

### Requirement: Waves List Focus Refresh
The system SHALL re-fetch the waves list and ungrouped photo count from the API every time the Waves screen gains focus, ensuring wave names, photo counts, and the ungrouped badge reflect the latest server state.

#### Scenario: User returns to Waves screen after viewing wave detail
- **WHEN** the Waves screen (WavesHub) regains focus (via `useFocusEffect`)
- **THEN** the system SHALL reset pagination and call `loadWaves` with page 0 and a new batch UUID in refresh mode
- **THEN** the waves list SHALL be replaced with the fresh server response including updated names and photo counts

#### Scenario: Ungrouped count refreshes on focus
- **WHEN** the Waves index screen regains focus
- **THEN** the system SHALL call `fetchUngroupedCount()` to re-query `getUngroupedPhotosCount`
- **THEN** the badge on the kebab menu icon SHALL display the current count

#### Scenario: Wave was renamed while viewing detail
- **WHEN** the user renamed a wave in WaveDetail and navigates back
- **THEN** the waves list SHALL show the updated wave name after the focus refresh completes

#### Scenario: Photos were removed while viewing detail
- **WHEN** photos were removed from a wave while viewing its detail and the user navigates back
- **THEN** the wave's `photosCount` in the list SHALL reflect the current count after the focus refresh

## ADDED Requirements

### Requirement: Empty State Hides Search Bar
The system SHALL hide the search bar when the waves list is empty.

#### Scenario: No waves exist
- **WHEN** the waves list has zero items (`waves.length === 0`)
- **THEN** the search bar SHALL NOT be rendered

#### Scenario: Waves exist
- **WHEN** the waves list has one or more items
- **THEN** the search bar SHALL be rendered normally

### Requirement: Empty State Shows Auto Group Action
The system SHALL display an "Auto Group" action button in the empty state card when there are ungrouped photos, in addition to the "Create a Wave" button.

#### Scenario: Empty state with ungrouped photos
- **WHEN** the waves list is empty AND `ungroupedCount` is greater than zero
- **THEN** the empty state card SHALL show a secondary action button with text "Auto Group N photos" where N is the count
- **THEN** tapping the button SHALL call `emitAutoGroup(ungroupedCount)` to trigger the auto-group flow

#### Scenario: Empty state with no ungrouped photos
- **WHEN** the waves list is empty AND `ungroupedCount` is zero
- **THEN** the empty state card SHALL NOT show the secondary auto-group action button

### Requirement: UngroupedCount Prop Passed to WavesHub
The system SHALL pass the `ungroupedCount` value from the route file to WavesHub as a prop.

#### Scenario: Route file passes count
- **WHEN** the Waves route renders WavesHub
- **THEN** it SHALL pass `ungroupedCount` as a prop: `<WavesHub ungroupedCount={ungroupedCount} />`

### Requirement: EmptyStateCard Secondary Action
The `EmptyStateCard` component SHALL support an optional secondary action button.

#### Scenario: Secondary action provided
- **WHEN** `secondaryActionText` and `onSecondaryActionPress` props are provided
- **THEN** a secondary button SHALL render below the primary action button
- **THEN** the secondary button SHALL have an outlined style (border, no fill) to differentiate from the primary

#### Scenario: Secondary action not provided
- **WHEN** `secondaryActionText` or `onSecondaryActionPress` is not provided
- **THEN** no secondary button SHALL be rendered (backward-compatible)
