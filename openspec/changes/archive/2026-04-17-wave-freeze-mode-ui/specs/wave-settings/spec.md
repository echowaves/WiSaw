## MODIFIED Requirements

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
