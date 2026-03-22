## MODIFIED Requirements

### Requirement: WavesHub context menu options
The WavesHub long-press context menu SHALL include the following options for wave owners: Cancel, Rename, Edit Description, Merge Into Another Wave..., Delete Wave. The "Delete Wave" option SHALL remain the destructive action. "Merge Into Another Wave..." SHALL be placed before "Delete Wave".

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
