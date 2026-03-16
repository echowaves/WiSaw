## ADDED Requirements

### Requirement: Wave Icon in Feed Header
The system SHALL display a ≋ (wave) icon in the upper-right corner of the main photo feed header.

#### Scenario: User views photo feed
- **WHEN** the photo feed is displayed
- **THEN** a wave icon is visible in the upper-right corner of the header

#### Scenario: User taps wave icon
- **WHEN** the user taps the wave icon
- **THEN** the Waves Hub screen is pushed onto the navigation stack

### Requirement: Upload Target Badge on Wave Icon
The wave icon SHALL visually indicate when an upload target wave is set via color tinting and a badge dot.

#### Scenario: No upload target set
- **WHEN** no upload target wave is active
- **THEN** the wave icon is displayed in the default/secondary text color

#### Scenario: Upload target is set
- **WHEN** an upload target wave is set
- **THEN** the wave icon is displayed in the app's main color
- **THEN** a small dot badge is shown on the icon

### Requirement: Upload Target Name on Long-Press
The system SHALL show the upload target wave name when the user long-presses the wave icon.

#### Scenario: User long-presses wave icon with target set
- **WHEN** the user long-presses the wave icon and an upload target wave is set
- **THEN** a brief tooltip or toast shows "Uploading to: {wave name}"

#### Scenario: User long-presses wave icon without target
- **WHEN** the user long-presses the wave icon and no upload target is set
- **THEN** a brief tooltip or toast shows "No upload target set"

### Requirement: Upload Target State Separation
The system SHALL maintain `uploadTargetWave` as a separate atom from the viewing/browsing state, persisted in SecureStore.

#### Scenario: User sets upload target in Waves Hub
- **WHEN** the user sets a wave as the upload target
- **THEN** the `uploadTargetWave` atom is updated
- **THEN** the value is persisted to SecureStore
- **THEN** the wave icon badge updates on the photo feed header

#### Scenario: App restarts with upload target set
- **WHEN** the app launches and a previously set upload target exists in storage
- **THEN** the `uploadTargetWave` atom is initialized with the stored value
- **THEN** the wave icon badge reflects the active upload target

#### Scenario: Legacy activeWave migration
- **WHEN** the app launches and detects an `activeWave` value in storage but no `uploadTargetWave`
- **THEN** the `activeWave` value is migrated to `uploadTargetWave`
- **THEN** the old `activeWave` storage key is cleared
