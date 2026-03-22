## ADDED Requirements

### Requirement: Wave Detail Focus Refresh
The system SHALL re-fetch the wave's photos from the API every time the WaveDetail screen gains focus, ensuring photos removed or deleted while away are no longer displayed.

#### Scenario: User returns to WaveDetail after navigating away
- **WHEN** the WaveDetail screen regains focus (via `useFocusEffect`)
- **THEN** the system SHALL reset pagination to page 0 with a new batch UUID
- **THEN** the system SHALL call `loadPhotos` to fetch fresh data from the `feedForWave` query
- **THEN** the photos list SHALL be replaced with the server response
- **THEN** all expanded photo states SHALL be cleared

#### Scenario: Photo was removed from wave while away
- **WHEN** the user navigates away, a photo is removed from the wave (via another screen or device), and the user returns
- **THEN** the removed photo SHALL no longer appear in the masonry grid after the focus refresh completes

#### Scenario: Photo was deleted while away
- **WHEN** the user navigates away, a photo is deleted, and the user returns
- **THEN** the deleted photo SHALL no longer appear in the masonry grid after the focus refresh completes

### Requirement: Wave Detail Header Title Sync
The system SHALL update the header title immediately after a successful wave rename, without requiring navigation.

#### Scenario: User renames wave from WaveDetail
- **WHEN** the user renames a wave via the edit modal in WaveDetail and the `updateWave` mutation succeeds
- **THEN** `router.setParams({ waveName: editName })` SHALL be called
- **THEN** the header title displayed by `AppHeader` in `[waveUuid].tsx` SHALL update to the new name immediately

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
