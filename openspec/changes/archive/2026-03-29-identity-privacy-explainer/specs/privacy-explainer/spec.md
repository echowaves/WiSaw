## ADDED Requirements

### Requirement: One-time privacy explainer before identity creation
The system SHALL display a full-screen privacy explainer view the first time a user without an established identity visits the identity screen. The explainer MUST be dismissed before the user can access the identity creation form.

#### Scenario: First visit without identity
- **WHEN** the user opens the identity screen for the first time and has no established identity
- **THEN** a full-screen privacy explainer view SHALL be displayed instead of the creation form

#### Scenario: Explainer content
- **WHEN** the privacy explainer is displayed
- **THEN** it SHALL show three information cards explaining: (1) that no personal information is ever stored on the server, (2) that the secret is the only key to the identity, and (3) that lost secrets cannot be recovered because the system has no way to identify the user

#### Scenario: Dismissing the explainer
- **WHEN** the user taps the "I Understand" button on the privacy explainer
- **THEN** the system SHALL persist a `identityPrivacyExplainerSeen` flag to SecureStore
- **THEN** the privacy explainer SHALL be replaced by the identity creation form

#### Scenario: Subsequent visits without identity
- **WHEN** the user opens the identity screen without an established identity but the SecureStore flag `identityPrivacyExplainerSeen` is set
- **THEN** the identity creation form SHALL be displayed directly without the explainer

#### Scenario: User with established identity
- **WHEN** the user opens the identity screen and has an established identity
- **THEN** the privacy explainer SHALL NOT be displayed regardless of the SecureStore flag

### Requirement: Explainer uses themed card styling
The privacy explainer view SHALL use the app's themed card design tokens (`CARD_BACKGROUND`, `CARD_SHADOW`, `BORDER_LIGHT`, `borderRadius: 16`) for visual consistency with the rest of the identity screen.

#### Scenario: Themed rendering
- **WHEN** the privacy explainer renders in light or dark mode
- **THEN** all cards and text SHALL use the current theme's tokens for backgrounds, borders, shadows, and text colors
