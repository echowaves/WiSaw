## MODIFIED Requirements

### Requirement: WaveDetail header menu options
The WaveDetail header SHALL display a kebab (three-dot vertical) menu icon using `MaterialCommunityIcons` `dots-vertical` (size 22) with styled button appearance matching the Waves list header (`SHARED_STYLES.interactive.headerButton`, themed background, and border). Tapping the icon SHALL open an `ActionMenu` modal with icon + label items for wave management. The menu SHALL include: Rename (`pencil-outline`), Edit Description (`text-box-edit-outline`), Merge Into Another Wave... (`call-merge`), and Delete Wave (`trash-can-outline`, destructive). A separator SHALL appear before the Delete item. All handler functions referenced by menu items MUST be defined before the `headerMenuItems` array that references them, to ensure valid function references at construction time.

#### Scenario: Wave Detail header renders kebab icon
- **WHEN** the user navigates to a Wave Detail screen
- **THEN** the header's right slot SHALL contain a TouchableOpacity styled with `SHARED_STYLES.interactive.headerButton`, `backgroundColor: theme.INTERACTIVE_BACKGROUND`, `borderWidth: 1`, `borderColor: theme.INTERACTIVE_BORDER`
- **THEN** the button SHALL contain a `dots-vertical` icon from `MaterialCommunityIcons` at size 22 with `theme.TEXT_PRIMARY` color

#### Scenario: Owner taps header kebab
- **WHEN** a wave owner taps the header kebab icon
- **THEN** an `ActionMenu` modal SHALL display with items:
  - `pencil-outline` icon: "Rename"
  - `text-box-edit-outline` icon: "Edit Description"
  - `call-merge` icon: "Merge Into Another Wave..."
  - separator
  - `trash-can-outline` icon: "Delete Wave" (destructive)

#### Scenario: User deletes wave from header menu
- **WHEN** the user selects Delete Wave from the ActionMenu
- **THEN** a confirmation `Alert.alert` dialog SHALL be shown with title "Delete Wave" and message "Are you sure? This cannot be undone." with Cancel and Delete buttons
- **THEN** upon confirmation, the `deleteWave` mutation SHALL be called with `{ waveUuid, uuid }`
- **THEN** the system SHALL emit `autoGroupDone` to trigger an ungrouped-photos count refresh
- **THEN** a success toast SHALL be shown with text "Wave deleted"
- **THEN** the system SHALL navigate back via `router.back()`

#### Scenario: Delete wave fails
- **WHEN** the `deleteWave` mutation throws an error
- **THEN** an error toast SHALL be shown with the error message
- **THEN** the user SHALL remain on the WaveDetail screen

#### Scenario: Handler declaration order
- **WHEN** the component defines `headerMenuItems`
- **THEN** all `onPress` handler functions (`handleDeleteWave`, etc.) MUST be declared above the `headerMenuItems` array in the source code to ensure valid references at construction time

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
