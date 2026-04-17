## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for identity profile card in WiSaw.

## ADDED Requirements

## Requirements

### Requirement: Identity profile card displays nickname and status
The system SHALL display an `IdentityProfileCard` component when the user has an established identity, showing their nickname and an active status indicator using the app's card-based design language (`CARD_BACKGROUND`, `borderRadius: 16`, themed shadows).

#### Scenario: Profile card renders for established identity
- **WHEN** the user opens the identity screen and has a stored nickname
- **THEN** the system SHALL display a profile card showing the nickname, a user icon, and an "Identity active" status indicator

#### Scenario: Profile card uses themed styling
- **WHEN** the profile card renders
- **THEN** it SHALL use `theme.CARD_BACKGROUND` for background, `theme.CARD_SHADOW` for shadows, `theme.BORDER_LIGHT` for border, and `borderRadius: 16` matching the `WaveCard` visual pattern

### Requirement: Profile card action rows
The system SHALL display action rows within the active-identity view for "Change Secret" and "Reset Identity" operations, styled as tappable card rows.

#### Scenario: Change secret action row
- **WHEN** the user views their active identity profile
- **THEN** a "Change Secret" action row SHALL be displayed with a key icon and forward chevron

#### Scenario: Reset identity action row
- **WHEN** the user views their active identity profile
- **THEN** a "Reset Identity" action row SHALL be displayed with a destructive color accent and a refresh icon

#### Scenario: Tapping change secret expands the update form
- **WHEN** the user taps the "Change Secret" action row
- **THEN** the update secret form SHALL expand or appear inline, showing fields for current secret, new secret, and confirm secret

### Requirement: Privacy notice card replaces warning card
The system SHALL display a `PrivacyNoticeCard` with positive, trust-building framing instead of the current red-themed `WarningCard`. The card SHALL communicate the same security information using a green/blue color scheme and a lock or shield icon.

#### Scenario: Privacy notice renders with positive framing
- **WHEN** the identity screen renders (in either no-identity or active-identity state)
- **THEN** a privacy notice card SHALL be displayed with a lock/shield icon, using green or blue accent colors, and text emphasizing that the identity is anonymous and secure

#### Scenario: Privacy notice content
- **WHEN** the privacy notice card is displayed
- **THEN** it SHALL communicate that the identity uses a strong unique secret, is completely anonymous, and requires no email or phone
