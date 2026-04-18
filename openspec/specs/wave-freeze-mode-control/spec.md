## Purpose
This specification defines expected user-visible behavior for the freeze mode selector control in wave settings.

## Requirements

### Requirement: Freeze mode selector control
The WaveSettings screen SHALL display a tri-state freeze mode selector with three options: Auto, Frozen, and Unlocked.

#### Scenario: Display current freeze mode
- **WHEN** WaveSettings loads for a wave with `freezeMode` set to `AUTO`
- **THEN** the "Auto" button SHALL be visually selected
- **WHEN** WaveSettings loads for a wave with `freezeMode` set to `FROZEN`
- **THEN** the "Frozen" button SHALL be visually selected
- **WHEN** WaveSettings loads for a wave with `freezeMode` set to `UNFROZEN`
- **THEN** the "Unlocked" button SHALL be visually selected

#### Scenario: Owner selects Frozen mode
- **WHEN** the owner taps the "Frozen" button
- **THEN** the app SHALL call `updateWave` with `freezeMode: "FROZEN"`
- **THEN** the wave SHALL become frozen immediately regardless of date settings

#### Scenario: Owner selects Unlocked mode
- **WHEN** the owner taps the "Unlocked" button
- **THEN** the app SHALL call `updateWave` with `freezeMode: "UNFROZEN"`
- **THEN** the wave SHALL become unfrozen immediately regardless of date settings

#### Scenario: Owner selects Auto mode
- **WHEN** the owner taps the "Auto" button
- **THEN** the app SHALL call `updateWave` with `freezeMode: "AUTO"`
- **THEN** the wave freeze state SHALL be determined by splash date and freeze date

### Requirement: Freeze mode selector positioning
The freeze mode selector SHALL be positioned immediately after the freeze date picker, grouping all freeze-related controls together.

#### Scenario: Visual layout
- **WHEN** the owner views the WaveSettings screen
- **THEN** the freeze mode selector SHALL appear below the freeze date picker
- **THEN** the selector SHALL use a three-button segmented layout matching the theme switcher pattern

### Requirement: Freeze mode selector always enabled
The freeze mode selector SHALL remain enabled regardless of wave frozen state, allowing the owner to change freeze mode at any time.

#### Scenario: Frozen wave freeze mode control
- **WHEN** the owner opens settings for a frozen wave
- **THEN** the freeze mode selector SHALL be enabled and interactive
- **THEN** the owner SHALL be able to switch to any freeze mode
