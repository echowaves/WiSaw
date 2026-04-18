## MODIFIED Requirements

### Requirement: One-time privacy explainer before identity creation
The system SHALL display a full-screen privacy explainer view the first time a user without an established identity visits the identity screen. The explainer MUST be dismissed before the user can access the identity attach form. When the explainer is dismissed, the attach form SHALL animate in visibly with a fade and scale animation. The explainer SHALL frame the upcoming action as attaching an identity to the device.

#### Scenario: First visit without identity
- **WHEN** the user opens the identity screen for the first time and has no established identity
- **THEN** a full-screen privacy explainer view SHALL be displayed instead of the attach form

#### Scenario: Explainer header copy
- **WHEN** the privacy explainer is displayed
- **THEN** the subtitle SHALL read "Before you attach your identity, here is how we protect your privacy."

#### Scenario: Explainer card content
- **WHEN** the privacy explainer is displayed
- **THEN** it SHALL show three information cards:
  1. **Zero Personal Data** — explaining that no personal information is stored on the server and that the identity exists only as a nickname-and-secret pair the user controls
  2. **Your Secret Travels With You** — explaining that the same nickname and secret on any device re-attaches the identity and that the system tracks no devices
  3. **Only You Can Restore It** — explaining that since the system does not know who the user is, only the nickname and secret unlock the identity, and that losing **either** one makes the identity unreachable forever

#### Scenario: Dismissing the explainer
- **WHEN** the user taps the "I Understand" button on the privacy explainer
- **THEN** the system SHALL persist a `identityPrivacyExplainerSeen` flag to SecureStore
- **THEN** the privacy explainer SHALL be replaced by the identity attach form
- **THEN** the attach form SHALL animate in with a fade (opacity 0→1 over 600ms) and scale spring animation

#### Scenario: Subsequent visits without identity
- **WHEN** the user opens the identity screen without an established identity but the SecureStore flag `identityPrivacyExplainerSeen` is set
- **THEN** the identity attach form SHALL be displayed directly without the explainer

#### Scenario: User with established identity
- **WHEN** the user opens the identity screen and has an established identity
- **THEN** the privacy explainer SHALL NOT be displayed regardless of the SecureStore flag

### Requirement: Explainer uses themed card styling
The privacy explainer view SHALL use the app's themed card design tokens (`CARD_BACKGROUND`, `CARD_SHADOW`, `BORDER_LIGHT`, `borderRadius: 16`) for visual consistency with the rest of the identity screen.

#### Scenario: Themed rendering
- **WHEN** the privacy explainer renders in light or dark mode
- **THEN** all cards and text SHALL use the current theme's tokens for backgrounds, borders, shadows, and text colors
