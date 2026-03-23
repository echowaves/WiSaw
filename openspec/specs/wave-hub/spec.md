### Requirement: Waves List Focus Refresh
The system SHALL re-fetch the waves list and ungrouped photo count from the API every time the Waves screen gains focus, ensuring wave names, photo counts, and the ungrouped badge reflect the latest server state. The refresh SHALL preserve the current sort order.

#### Scenario: User returns to Waves screen after viewing wave detail
- **WHEN** the Waves screen (WavesHub) regains focus (via `useFocusEffect`)
- **THEN** the system SHALL reset pagination and call `loadWaves` with page 0, a new batch UUID, and the current `sortBy`/`sortDirection` values in refresh mode
- **THEN** the waves list SHALL be replaced with the fresh server response including updated names and photo counts in the current sort order

#### Scenario: Ungrouped count refreshes on focus
- **WHEN** the Waves index screen regains focus
- **THEN** the system SHALL call `fetchUngroupedCount()` to re-query `getUngroupedPhotosCount`
- **THEN** the badge on the kebab menu icon SHALL display the current count

#### Scenario: Wave was renamed while viewing detail
- **WHEN** the user renamed a wave in WaveDetail and navigates back
- **THEN** the waves list SHALL show the updated wave name after the focus refresh completes

#### Scenario: Photos were removed while viewing detail
- **WHEN** photos were removed from a wave while viewing its detail and the user navigates back
- **THEN** the wave's `photosCount` in the list SHALL reflect the current count after the focus refresh completes

## REMOVED Requirements

### Requirement: Upload Target Bar Display
**Reason**: The upload target concept is being removed entirely. Users no longer set a persistent upload target wave.
**Migration**: Users navigate to a wave detail screen and use the camera footer there to upload photos to a specific wave.

## MODIFIED Requirements

### Requirement: Wave Card Context Menu
The system SHALL show a context menu on long-press of a wave card with management options.

#### Scenario: Owner long-presses their own wave card
- **WHEN** the wave owner long-presses a wave card
- **THEN** a context menu appears with options: Rename, Edit Description, Share Wave, Merge Into Another Wave..., Delete Wave

#### Scenario: User deletes a wave from context menu
- **WHEN** the user selects Delete Wave from the context menu
- **THEN** a confirmation dialog is shown
- **THEN** upon confirmation, the wave is deleted and removed from the grid
- **THEN** the system SHALL emit `autoGroupDone` to trigger an ungrouped-photos count refresh

#### Scenario: Owner long-presses a wave (iOS)
- **WHEN** a wave owner long-presses a wave card on iOS
- **THEN** ActionSheetIOS SHALL display: Cancel, Rename, Edit Description, Merge Into Another Wave..., Delete Wave
- **THEN** the destructive button index SHALL point to Delete Wave

#### Scenario: Owner long-presses a wave (Android)
- **WHEN** a wave owner long-presses a wave card on Android
- **THEN** an Alert SHALL display buttons: Cancel, Rename, Merge Into Another Wave..., Delete Wave

#### Scenario: Post-merge list update
- **WHEN** a merge completes successfully from WavesHub
- **THEN** the source wave SHALL be removed from the waves list
- **THEN** the target wave's `photosCount` SHALL be updated to reflect the merged total
- **THEN** a success toast SHALL be shown

### Requirement: Waves List Loading Progress Bar
The system SHALL display a `LinearProgress` bar at the top of the WavesHub content area whenever wave data is loading, matching the PhotosList loading indicator pattern. The bar SHALL be rendered in `WavesHub` (the component used by the route), positioned between the search bar and the FlatList.

#### Scenario: Waves are loading
- **WHEN** the `loading` state is true (initial load, pagination, or refresh)
- **THEN** a 3px `LinearProgress` bar SHALL be displayed between the search bar and the waves FlatList
- **THEN** the bar SHALL use `CONST.MAIN_COLOR` as the color and `theme.HEADER_BACKGROUND` as the track background

#### Scenario: Waves finish loading
- **WHEN** the `loading` state becomes false
- **THEN** the `LinearProgress` bar SHALL be hidden

#### Scenario: User interacts while loading
- **WHEN** the progress bar is visible
- **THEN** the waves list and all other UI elements SHALL remain interactive (non-blocking)

### Requirement: WavesHub Subscribes to AddWave Event
The system SHALL subscribe to the `addWave` event in WavesHub so that the header kebab menu can trigger the create-wave modal.

#### Scenario: Header menu emits addWave event
- **WHEN** the user selects "Create New Wave" from the Waves header kebab menu
- **THEN** `emitAddWave()` SHALL be called
- **THEN** WavesHub SHALL receive the event via `subscribeToAddWave`
- **THEN** WavesHub SHALL set `modalVisible` to true, opening the existing create-wave modal

#### Scenario: AddWave subscription cleanup
- **WHEN** WavesHub unmounts
- **THEN** the `subscribeToAddWave` listener SHALL be unsubscribed to prevent memory leaks

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
