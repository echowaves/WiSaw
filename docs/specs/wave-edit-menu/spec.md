## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for wave edit menu in WiSaw.

## ADDED Requirements

## Requirements

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
