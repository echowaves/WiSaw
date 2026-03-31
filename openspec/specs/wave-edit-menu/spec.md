## ADDED Requirements

### Requirement: Single edit wave menu item
The wave action sheet SHALL display a single "Edit Wave" menu item instead of separate "Rename" and "Edit Description" items.

#### Scenario: WaveDetail header menu shows single edit item
- **WHEN** the user opens the header menu on the WaveDetail screen
- **THEN** the menu SHALL display one "Edit Wave" item with a pencil-outline icon
- **THEN** the menu SHALL NOT display separate "Rename" or "Edit Description" items

#### Scenario: WavesHub context menu shows single edit item
- **WHEN** the wave owner long-presses a wave card on the WavesHub screen
- **THEN** the context menu SHALL display one "Edit Wave" item with a pencil-outline icon
- **THEN** the context menu SHALL NOT display separate "Rename" or "Edit Description" items

### Requirement: Edit wave opens existing edit modal
The "Edit Wave" menu item SHALL open the existing edit modal with both name and description fields.

#### Scenario: Tapping edit wave in WaveDetail
- **WHEN** the user taps "Edit Wave" in the WaveDetail header menu
- **THEN** the edit modal SHALL appear with the current wave name pre-filled and description field available

#### Scenario: Tapping edit wave in WavesHub
- **WHEN** the wave owner taps "Edit Wave" in the WavesHub context menu
- **THEN** the edit modal SHALL appear with the wave's name and description pre-filled

### Requirement: Kebab menu badge count capped at 99+
The kebab menu ungrouped count badge on the Waves screen SHALL display "99+" when the count exceeds 99, instead of the raw number.

#### Scenario: Count is 99 or less
- **WHEN** the ungrouped photos count is between 1 and 99
- **THEN** the kebab menu badge SHALL display the exact numeric count

#### Scenario: Count exceeds 99
- **WHEN** the ungrouped photos count is 100 or greater
- **THEN** the kebab menu badge SHALL display "99+"
