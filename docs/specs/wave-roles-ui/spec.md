## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for wave roles ui in WiSaw.

## Requirements

### Requirement: Role display on wave cards
Each wave card in the Waves Hub SHALL display the user's role as a badge or label.

#### Scenario: Owner role displayed
- **WHEN** the user's `myRole` for a wave is `owner`
- **THEN** the wave card SHALL display an "Owner" badge

#### Scenario: Facilitator role displayed
- **WHEN** the user's `myRole` for a wave is `facilitator`
- **THEN** the wave card SHALL display a "Facilitator" badge

#### Scenario: Contributor role displayed
- **WHEN** the user's `myRole` for a wave is `contributor`
- **THEN** the wave card SHALL display a "Contributor" badge

### Requirement: Role display on wave detail header
The wave detail screen SHALL indicate the user's role in the wave.

#### Scenario: Role shown in wave detail
- **WHEN** the user opens a wave detail screen
- **THEN** the screen SHALL display the user's role (owner/facilitator/contributor) in a subtitle or badge beneath the wave name

### Requirement: Role-gated action menus
Wave action menus SHALL display only the actions permitted for the user's role.

#### Scenario: Owner wave detail menu
- **WHEN** the wave owner opens the wave detail header menu
- **THEN** the menu SHALL display: Edit Wave, Share Wave, Manage Members, Wave Settings, Delete Wave, and sort options

#### Scenario: Facilitator wave detail menu
- **WHEN** a facilitator opens the wave detail header menu
- **THEN** the menu SHALL display: Share Wave, Moderation, and sort options
- **THEN** the menu SHALL NOT display: Edit Wave, Wave Settings, Delete Wave, Manage Members (assign/remove roles)

#### Scenario: Contributor wave detail menu
- **WHEN** a contributor opens the wave detail header menu
- **THEN** the menu SHALL display sort options and Report Content
- **THEN** the menu SHALL NOT display: Edit Wave, Share Wave, Wave Settings, Delete Wave, Manage Members, Moderation

### Requirement: Role-gated photo actions
Photo action buttons within wave context SHALL respect the user's role and wave frozen state.

#### Scenario: Owner photo actions in unfrozen wave
- **WHEN** the wave owner views a photo in an unfrozen wave
- **THEN** the owner SHALL see all photo actions including remove from wave and delete photo

#### Scenario: Owner photo actions in frozen wave
- **WHEN** the wave owner views a photo in a frozen wave
- **THEN** the owner SHALL see remove from wave and delete photo (owner privilege on frozen waves)

#### Scenario: Facilitator photo actions in unfrozen wave
- **WHEN** a facilitator views a photo in an unfrozen wave
- **THEN** the facilitator SHALL see remove from wave and report options

#### Scenario: Facilitator photo actions in frozen wave
- **WHEN** a facilitator views a photo in a frozen wave
- **THEN** the facilitator SHALL NOT see remove from wave or delete photo options
- **THEN** the facilitator SHALL see the report option

#### Scenario: Contributor photo actions in unfrozen wave
- **WHEN** a contributor views their own photo in an unfrozen wave
- **THEN** the contributor SHALL see remove from wave for their own photos only
- **THEN** the contributor SHALL see the report option for other users' photos

#### Scenario: Contributor photo actions in frozen wave
- **WHEN** a contributor views a photo in a frozen wave
- **THEN** the contributor SHALL NOT see remove or delete actions
- **THEN** the contributor SHALL NOT see the report option (frozen content is immutable)

### Requirement: Frozen state visual indicator
Wave cards and detail screens SHALL clearly indicate when a wave is frozen.

#### Scenario: Frozen wave card indicator
- **WHEN** a wave's `isFrozen` is true
- **THEN** the wave card SHALL display a frozen indicator (e.g., snowflake icon or "Frozen" label)

#### Scenario: Frozen wave detail indicator
- **WHEN** the user opens a frozen wave's detail screen
- **THEN** the header SHALL display a frozen indicator
- **THEN** a banner or notice SHALL explain that this wave is frozen and its content is immutable

### Requirement: Active/inactive state indicator
Wave cards SHALL indicate whether a wave is currently active (accepting contributions).

#### Scenario: Active wave indicator
- **WHEN** a wave's `isActive` is true (startDate has passed or is null, and wave is not frozen)
- **THEN** the wave card SHALL display an active state indicator

#### Scenario: Inactive wave indicator
- **WHEN** a wave's `isActive` is false (startDate has not yet arrived)
- **THEN** the wave card SHALL display an inactive/pending state indicator with the start date
