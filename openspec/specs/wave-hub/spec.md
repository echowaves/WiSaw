### Requirement: Waves List Focus Refresh
The system SHALL re-fetch the waves list and ungrouped photo count from the API every time the Waves screen gains focus, ensuring wave names, photo counts, and the ungrouped badge reflect the latest server state.

#### Scenario: User returns to Waves screen after viewing wave detail
- **WHEN** the Waves screen (WavesHub) regains focus (via `useFocusEffect`)
- **THEN** the system SHALL reset pagination and call `loadWaves` with page 0 and a new batch UUID in refresh mode
- **THEN** the waves list SHALL be replaced with the fresh server response including updated names and photo counts

#### Scenario: Ungrouped count refreshes on focus
- **WHEN** the Waves index screen regains focus
- **THEN** the system SHALL call `fetchUngroupedCount()` to re-query `getUngroupedPhotosCount`
- **THEN** the badge on the auto-group button SHALL display the current count

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
