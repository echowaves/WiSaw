## MODIFIED Requirements

### Requirement: WaveDetail header menu options
The WaveDetail header ellipsis menu SHALL include the following options for wave owners: Cancel, Rename, Edit Description, Merge Into Another Wave..., Delete Wave. The "Delete Wave" option SHALL remain the destructive action. "Merge Into Another Wave..." SHALL be placed before "Delete Wave".

#### Scenario: Owner taps header ellipsis (iOS)
- **WHEN** a wave owner taps the header ellipsis icon on iOS
- **THEN** ActionSheetIOS SHALL display: Cancel, Rename, Edit Description, Merge Into Another Wave..., Delete Wave
- **THEN** the destructive button index SHALL point to Delete Wave

#### Scenario: Owner taps header ellipsis (Android)
- **WHEN** a wave owner taps the header ellipsis icon on Android
- **THEN** an Alert SHALL display buttons: Cancel, Rename, Merge Into Another Wave..., Delete Wave

#### Scenario: User deletes wave from header menu
- **WHEN** the user selects Delete Wave from the header ellipsis menu
- **THEN** a confirmation dialog is shown
- **THEN** upon confirmation, the `deleteWave` mutation SHALL be called
- **THEN** the system SHALL emit `autoGroupDone` to trigger an ungrouped-photos count refresh
- **THEN** the system SHALL navigate back via `router.back()`
- **THEN** a success toast SHALL be shown

#### Scenario: Owner renames wave
- **WHEN** the user edits the wave name and taps Save
- **THEN** the `updateWave` mutation SHALL be called
- **THEN** on success, `router.setParams({ waveName: editName })` SHALL update route params
- **THEN** the local `waveName` state SHALL be updated
- **THEN** a success toast SHALL be shown

#### Scenario: Post-merge navigation
- **WHEN** a merge completes successfully from WaveDetail
- **THEN** the system SHALL navigate back (via `router.back()`)
- **THEN** a success toast SHALL be shown with the target wave name
