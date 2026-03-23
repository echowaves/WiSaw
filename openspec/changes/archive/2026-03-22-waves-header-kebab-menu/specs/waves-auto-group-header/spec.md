## MODIFIED Requirements

### Requirement: Auto-Group Button in Waves Header
The system SHALL display a kebab (three-dot vertical) menu icon in the upper-right navigation bar of the Waves screen. Tapping the icon SHALL open a platform-native context menu with two items: "Create New Wave" and "Auto Group".

#### Scenario: Waves screen renders header with kebab menu icon
- **WHEN** the user navigates to the Waves screen (via drawer or waves-hub route)
- **THEN** the header's right slot SHALL contain a button with a `dots-vertical` icon (MaterialCommunityIcons)

#### Scenario: User taps kebab menu icon (iOS)
- **WHEN** the user taps the kebab icon on iOS
- **THEN** ActionSheetIOS SHALL display options: Cancel, Create New Wave, Auto Group (N ungrouped)
- **THEN** the cancel button index SHALL be 0
- **THEN** if ungroupedCount is zero, the Auto Group option text SHALL be "Auto Group"
- **THEN** if ungroupedCount is greater than zero, the Auto Group option text SHALL be "Auto Group (N ungrouped)" where N is the count

#### Scenario: User taps kebab menu icon (Android)
- **WHEN** the user taps the kebab icon on Android
- **THEN** an Alert SHALL display with title "Waves" and buttons: Cancel, Create New Wave, Auto Group (N ungrouped)
- **THEN** if ungroupedCount is zero, the Auto Group button text SHALL be "Auto Group"
- **THEN** if ungroupedCount is greater than zero, the Auto Group button text SHALL be "Auto Group (N ungrouped)" where N is the count

#### Scenario: User selects Create New Wave from menu
- **WHEN** the user selects "Create New Wave" from the kebab menu
- **THEN** the system SHALL emit the `addWave` event via `emitAddWave()`
- **THEN** WavesHub SHALL receive the event and open the create-wave modal

#### Scenario: User selects Auto Group from menu
- **WHEN** the user selects "Auto Group" from the kebab menu
- **THEN** the system SHALL call `emitAutoGroup(ungroupedCount)` to trigger the existing auto-group flow

#### Scenario: Auto-group button shows ungrouped photo count badge
- **WHEN** the Waves screen loads or refreshes
- **THEN** the system SHALL call `getUngroupedPhotosCount(uuid)` GraphQL query
- **THEN** the count SHALL be stored for use in the menu item text
- **THEN** no badge SHALL be displayed on the kebab icon itself

### Requirement: getUngroupedPhotosCount Query
The system SHALL expose a `getUngroupedPhotosCount` function in the waves reducer that calls the `getUngroupedPhotosCount(uuid)` GraphQL query.

#### Scenario: Query returns count
- **WHEN** `getUngroupedPhotosCount` is called with a valid uuid
- **THEN** the function SHALL return an integer representing the number of photos not assigned to any wave
