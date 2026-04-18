## MODIFIED Requirements

### Requirement: Identity profile card displays nickname and status
The system SHALL display an `IdentityProfileCard` component when the user has an established identity, showing their nickname and a status indicator that names the device-binding state, using the app's card-based design language (`CARD_BACKGROUND`, `borderRadius: 16`, themed shadows).

#### Scenario: Profile card renders for established identity
- **WHEN** the user opens the identity screen and has a stored nickname
- **THEN** the system SHALL display a profile card showing the nickname, a user icon, and a status indicator with the text "Attached to this device"

#### Scenario: Profile card uses themed styling
- **WHEN** the profile card renders
- **THEN** it SHALL use `theme.CARD_BACKGROUND` for background, `theme.CARD_SHADOW` for shadows, `theme.BORDER_LIGHT` for border, and `borderRadius: 16` matching the `WaveCard` visual pattern

### Requirement: Profile card action rows
The system SHALL display action rows within the active-identity view for "Change Secret" and "Detach from This Device" operations, styled as tappable card rows.

#### Scenario: Change secret action row
- **WHEN** the user views their active identity profile
- **THEN** a "Change Secret" action row SHALL be displayed with a key icon and forward chevron

#### Scenario: Detach action row
- **WHEN** the user views their active identity profile
- **THEN** a "Detach from This Device" action row SHALL be displayed with a destructive color accent and an unbinding icon (e.g. `unlink`)

#### Scenario: Tapping change secret expands the update form
- **WHEN** the user taps the "Change Secret" action row
- **THEN** the update secret form SHALL expand or appear inline, showing fields for current secret, new secret, and confirm secret

### Requirement: Privacy notice card replaces warning card
The system SHALL display a `PrivacyNoticeCard` with positive, trust-building framing instead of the legacy red-themed warning card. The card SHALL communicate the privacy and recovery model using a green/blue color scheme and a lock or shield icon.

#### Scenario: Privacy notice renders with positive framing
- **WHEN** the identity screen renders (in either no-identity or active-identity state)
- **THEN** a privacy notice card SHALL be displayed with a lock/shield icon, using green or blue accent colors

#### Scenario: Privacy notice content
- **WHEN** the privacy notice card is displayed
- **THEN** its bullet list SHALL communicate, in this order:
  1. No personal information is stored on the server — the nickname and secret **are** the identity
  2. The same nickname and secret work on any device, anywhere
  3. If the user forgets the nickname **or** the secret, no one — including the operators of the service — can recover it
  4. Detaching is non-destructive: the identity is not deleted, only removed from the current device
