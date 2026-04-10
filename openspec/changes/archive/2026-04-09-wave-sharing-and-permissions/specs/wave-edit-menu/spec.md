## MODIFIED Requirements

### Requirement: Single edit wave menu item
The wave action sheet SHALL display a single "Edit Wave" menu item instead of separate "Rename" and "Edit Description" items. This item SHALL only be visible to the wave owner.

#### Scenario: WaveDetail header menu shows single edit item for owner
- **WHEN** the wave owner opens the header menu on the WaveDetail screen
- **THEN** the menu SHALL display one "Edit Wave" item with a pencil-outline icon
- **THEN** the menu SHALL NOT display separate "Rename" or "Edit Description" items

#### Scenario: Non-owner does not see edit item
- **WHEN** a facilitator or contributor opens the header menu on the WaveDetail screen
- **THEN** the menu SHALL NOT display the "Edit Wave" item

#### Scenario: WavesHub context menu shows single edit item for owner
- **WHEN** the wave owner long-presses a wave card on the WavesHub screen
- **THEN** the context menu SHALL display one "Edit Wave" item with a pencil-outline icon

#### Scenario: Non-owner WavesHub context menu
- **WHEN** a facilitator or contributor long-presses a wave card on the WavesHub screen
- **THEN** the context menu SHALL NOT display the "Edit Wave" item

## ADDED Requirements

### Requirement: Wave settings menu item
The wave action menus SHALL include a "Wave Settings" item for owners only, linking to the wave settings screen.

#### Scenario: Owner sees wave settings
- **WHEN** the wave owner opens the wave detail header menu or wave card context menu
- **THEN** the menu SHALL display a "Wave Settings" item with a gear icon

#### Scenario: Non-owner does not see wave settings
- **WHEN** a facilitator or contributor opens the wave detail header menu
- **THEN** the menu SHALL NOT display a "Wave Settings" item

### Requirement: Share wave menu item
The wave action menus SHALL include a "Share Wave" item for owners and facilitators.

#### Scenario: Owner or facilitator sees share option
- **WHEN** the wave owner or a facilitator opens the wave detail header menu
- **THEN** the menu SHALL display a "Share Wave" item with a share icon
- **THEN** tapping it SHALL open the WaveShareModal

### Requirement: Manage members menu item
The wave action menus SHALL include a "Manage Members" item for owners.

#### Scenario: Owner sees manage members
- **WHEN** the wave owner opens the wave detail header menu
- **THEN** the menu SHALL display a "Manage Members" item with a people icon

### Requirement: Moderation menu item
The wave action menus SHALL include a "Moderation" item for owners and facilitators.

#### Scenario: Owner or facilitator sees moderation
- **WHEN** the wave owner or a facilitator opens the wave detail header menu
- **THEN** the menu SHALL display a "Moderation" item with a shield icon
