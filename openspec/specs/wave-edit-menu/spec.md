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
