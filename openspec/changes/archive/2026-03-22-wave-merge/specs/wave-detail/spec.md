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

#### Scenario: Post-merge navigation
- **WHEN** a merge completes successfully from WaveDetail
- **THEN** the system SHALL navigate back (via `router.back()`)
- **THEN** a success toast SHALL be shown with the target wave name
