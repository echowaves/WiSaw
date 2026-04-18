## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for wave settings in WiSaw.

## Requirements

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
The wave settings screen SHALL allow the owner to control wave freeze behavior via a tri-state freeze mode selector (Auto / Frozen / Unlocked) instead of a binary toggle.

#### Scenario: Owner freezes wave
- **WHEN** the owner selects "Frozen" in the freeze mode selector
- **THEN** the app SHALL call `updateWave` with `freezeMode: "FROZEN"`
- **THEN** the wave SHALL become frozen immediately regardless of date settings

#### Scenario: Owner unfreezes wave
- **WHEN** the owner selects "Unlocked" in the freeze mode selector
- **THEN** the app SHALL call `updateWave` with `freezeMode: "UNFROZEN"`
- **THEN** the wave SHALL become unfrozen immediately regardless of date settings

#### Scenario: Owner sets auto freeze
- **WHEN** the owner selects "Auto" in the freeze mode selector
- **THEN** the app SHALL call `updateWave` with `freezeMode: "AUTO"`
- **THEN** the wave freeze state SHALL be determined by splash date and freeze date

#### Scenario: Both freeze mechanisms
- **WHEN** a wave has `freezeMode: "FROZEN"` and an `endDate` in the future
- **THEN** the wave SHALL remain frozen (explicit mode takes precedence)
- **WHEN** a wave has `freezeMode: "UNFROZEN"` and an `endDate` in the past
- **THEN** the wave SHALL remain unfrozen (explicit mode takes precedence)

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

### Requirement: Settings only editable when not date-frozen
The wave settings screen SHALL disable settings based on date-frozen state (computed from `splashDate` and `freezeDate`) rather than effective frozen state.

#### Scenario: Date-frozen wave settings
- **WHEN** the owner opens settings for a wave where `now < splashDate` or `now > freezeDate`
- **THEN** name, description, open/closed toggle, start date, and geo boundaries SHALL be disabled/read-only
- **THEN** freeze mode selector and freeze date SHALL remain editable
- **THEN** a notice SHALL explain that the wave is date-frozen

#### Scenario: Mode-frozen but date-active wave settings
- **WHEN** the owner opens settings for a wave with `freezeMode: "FROZEN"` but dates within active range
- **THEN** all settings SHALL remain enabled (date range is active)
- **THEN** the freeze mode selector SHALL show "Frozen" as selected

#### Scenario: Mode-unlocked but date-expired wave settings
- **WHEN** the owner opens settings for a wave with `freezeMode: "UNFROZEN"` but dates expired
- **THEN** name, description, open/closed toggle, start date, and geo boundaries SHALL be disabled
- **THEN** freeze mode selector and freeze date SHALL remain editable
