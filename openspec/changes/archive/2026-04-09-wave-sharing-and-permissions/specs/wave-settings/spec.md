## ADDED Requirements

### Requirement: Wave settings screen
The app SHALL provide a wave settings screen accessible to wave owners only, allowing configuration of wave type, dates, geo boundaries, and freeze status.

#### Scenario: Owner opens wave settings
- **WHEN** the wave owner taps "Wave Settings" in the wave detail menu
- **THEN** a settings screen SHALL display with the current wave configuration

### Requirement: Open/closed wave toggle
The wave settings screen SHALL allow the owner to toggle between open and invite-only wave types.

#### Scenario: Toggle wave to open
- **WHEN** the owner toggles the wave type to "Open"
- **THEN** the app SHALL call `updateWave` with `open: true`
- **THEN** the wave's `joinUrl` SHALL become available for sharing

#### Scenario: Toggle wave to invite-only
- **WHEN** the owner toggles the wave type to "Invite Only"
- **THEN** the app SHALL call `updateWave` with `open: false`
- **THEN** the wave's `joinUrl` SHALL be set to null
- **THEN** new members SHALL only be able to join via invite tokens

### Requirement: Wave start and end dates
The wave settings screen SHALL allow the owner to set optional start and end dates for the wave.

#### Scenario: Set start date
- **WHEN** the owner sets a start date
- **THEN** the app SHALL call `updateWave` with `startDate` set to the selected datetime
- **THEN** the wave SHALL not accept photo contributions until the start date arrives

#### Scenario: Set end date
- **WHEN** the owner sets an end date
- **THEN** the app SHALL call `updateWave` with `endDate` set to the selected datetime
- **THEN** the wave SHALL automatically freeze when the end date passes

#### Scenario: Extend end date on frozen wave
- **WHEN** the owner extends the end date to a future date on a wave that was auto-frozen by reaching its end date
- **THEN** the app SHALL call `updateWave` with the new `endDate`
- **THEN** the wave SHALL unfreeze (become active again) if `frozen` flag is not explicitly set

#### Scenario: Clear dates
- **WHEN** the owner clears the start or end date
- **THEN** the app SHALL call `updateWave` with the corresponding date set to null

### Requirement: Wave freeze control
The wave settings screen SHALL allow the owner to manually freeze or unfreeze a wave.

#### Scenario: Owner freezes wave
- **WHEN** the owner toggles the freeze switch to on
- **THEN** the app SHALL call `updateWave` with `frozen: true`
- **THEN** the wave SHALL become frozen immediately
- **THEN** a confirmation dialog SHALL be shown explaining that freezing prevents all modifications to wave content

#### Scenario: Owner unfreezes wave
- **WHEN** the owner toggles the freeze switch to off
- **THEN** the app SHALL call `updateWave` with `frozen: false`
- **THEN** the wave SHALL become unfrozen (unless endDate has passed)

#### Scenario: Both freeze mechanisms
- **WHEN** a wave has both an explicit `frozen: true` flag and an `endDate` in the past
- **THEN** the wave remains frozen
- **THEN** unfreezing requires both clearing `frozen: false` AND extending `endDate` or clearing it

### Requirement: Geo boundary configuration
The wave settings screen SHALL allow the owner to set geographic boundaries for photo contributions.

#### Scenario: Set geo boundaries
- **WHEN** the owner sets a center point (via map picker or coordinate input) and radius
- **THEN** the app SHALL call `updateWave` with `lat`, `lon`, and `radius`
- **THEN** photos uploaded outside this boundary SHALL be rejected by the backend

#### Scenario: Clear geo boundaries
- **WHEN** the owner clears the geo boundary settings
- **THEN** the app SHALL call `updateWave` with `lat: null`, `lon: null`, `radius: null`
- **THEN** the wave SHALL accept photos from any location

#### Scenario: Display current geo boundaries
- **WHEN** the wave has geo boundaries configured
- **THEN** the settings screen SHALL display the center point and radius
- **THEN** if a map component is available, it SHALL show the boundary circle on a map

### Requirement: Settings only editable when not frozen
The wave settings screen SHALL disable all settings except freeze toggle and end date when the wave is frozen.

#### Scenario: Frozen wave settings
- **WHEN** the owner opens settings for a frozen wave
- **THEN** name, description, open/closed toggle, start date, and geo boundaries SHALL be disabled/read-only
- **THEN** freeze toggle and end date SHALL remain editable
- **THEN** a notice SHALL explain that the wave is frozen and only freeze status and end date can be changed
