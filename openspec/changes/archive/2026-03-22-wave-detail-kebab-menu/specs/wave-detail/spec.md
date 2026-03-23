## MODIFIED Requirements

### Requirement: WaveDetail header menu options
The WaveDetail header SHALL display a kebab (three-dot vertical) menu icon using `MaterialCommunityIcons` `dots-vertical` (size 22) with styled button appearance matching the Waves list header (`SHARED_STYLES.interactive.headerButton`, themed background, and border). The menu SHALL include the following options for wave owners: Cancel, Rename, Edit Description, Merge Into Another Wave..., Delete Wave. The "Delete Wave" option SHALL remain the destructive action. "Merge Into Another Wave..." SHALL be placed before "Delete Wave".

#### Scenario: Wave Detail header renders kebab icon
- **WHEN** the user navigates to a Wave Detail screen
- **THEN** the header's right slot SHALL contain a TouchableOpacity styled with `SHARED_STYLES.interactive.headerButton`, `backgroundColor: theme.INTERACTIVE_BACKGROUND`, `borderWidth: 1`, `borderColor: theme.INTERACTIVE_BORDER`
- **THEN** the button SHALL contain a `dots-vertical` icon from `MaterialCommunityIcons` at size 22 with `theme.TEXT_PRIMARY` color

#### Scenario: Owner taps header kebab (iOS)
- **WHEN** a wave owner taps the header kebab icon on iOS
- **THEN** ActionSheetIOS SHALL display: Cancel, Rename, Edit Description, Merge Into Another Wave..., Delete Wave
- **THEN** the destructive button index SHALL point to Delete Wave

#### Scenario: Owner taps header kebab (Android)
- **WHEN** a wave owner taps the header kebab icon on Android
- **THEN** an Alert SHALL display buttons: Cancel, Rename, Merge Into Another Wave..., Delete Wave

#### Scenario: User deletes wave from header menu
- **WHEN** the user selects Delete Wave from the header kebab menu
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
