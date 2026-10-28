## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for drawer identity badge in WiSaw.

## ADDED Requirements

## Requirements

### Requirement: Drawer displays identity badge when identity is established
The system SHALL display an identity badge at the top of the drawer navigation content when the user has a non-empty nickname, showing the nickname and a user icon.

#### Scenario: Identity badge shows nickname
- **WHEN** the drawer is opened and the `nickName` Jotai atom is non-empty
- **THEN** an identity badge SHALL be displayed above the drawer item list, showing the nickname with a user-secret icon and an "Identity active" label

#### Scenario: Identity badge uses themed styling
- **WHEN** the identity badge renders
- **THEN** it SHALL use `theme.CARD_BACKGROUND` for background, `CONST.MAIN_COLOR` for the icon accent, and styling consistent with the drawer's existing design tokens

### Requirement: Drawer displays setup prompt when no identity exists
The system SHALL display a tappable "Set up identity" prompt at the top of the drawer navigation when the user has no established identity (empty nickname).

#### Scenario: Setup prompt shown when no nickname
- **WHEN** the drawer is opened and the `nickName` Jotai atom is empty
- **THEN** a tappable prompt SHALL be displayed above the drawer item list showing "Set up identity" with a user-plus icon

#### Scenario: Tapping setup prompt navigates to identity screen
- **WHEN** the user taps the "Set up identity" prompt in the drawer
- **THEN** the system SHALL navigate to the identity screen and close the drawer
