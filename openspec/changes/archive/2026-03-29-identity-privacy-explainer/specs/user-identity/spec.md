## MODIFIED Requirements

### Requirement: Identity Management Screen
The system SHALL provide an identity screen with two distinct visual states: a creation flow when no identity exists, and an active-identity profile view when an identity is established. The creation flow subtitle SHALL explicitly state that no personal information is ever stored on the server, and that the secret is the only way to access the identity.

#### Scenario: User opens identity screen with no identity
- **WHEN** the user navigates to the identity screen from the drawer menu and has no stored nickname
- **THEN** the system SHALL display a creation flow with a subtitle stating: "We never store any personal information on our servers. Your secret is the only way to access your identity — write it down and keep it safe."

#### Scenario: User opens identity screen with established identity
- **WHEN** the user navigates to the identity screen from the drawer menu and has a stored nickname
- **THEN** the system SHALL display an `IdentityProfileCard` showing the nickname and identity status, followed by action rows for "Change Secret" and "Reset Identity"

#### Scenario: Creation flow uses EmptyStateCard visual pattern
- **WHEN** the identity creation flow renders
- **THEN** it SHALL use the same visual language as `EmptyStateCard` — centered card with icon circle (`borderRadius: 60`, orange-tinted background), heading text, subtitle, and themed card styling (`CARD_BACKGROUND`, `borderRadius: 24`, shadows)

#### Scenario: Active identity view uses card-based layout
- **WHEN** the active identity view renders
- **THEN** all sections SHALL use card-based layouts with `borderRadius: 16`, `theme.CARD_BACKGROUND`, `theme.CARD_SHADOW`, and `theme.BORDER_LIGHT` consistent with the Waves feature styling

## ADDED Requirements

### Requirement: Privacy notice card communicates zero-PII guarantee
The `PrivacyNoticeCard` SHALL explicitly state that no personal information is stored on the server and frame secret unrecoverability as a direct consequence of the privacy-by-design architecture.

#### Scenario: Privacy notice card content
- **WHEN** the `PrivacyNoticeCard` is displayed on the identity screen
- **THEN** it SHALL include text stating that no personal information is stored on the servers, that the secret is the only key to the identity, and that lost secrets cannot be recovered

### Requirement: Reset confirmation dialog explains why recovery is impossible
The reset identity confirmation dialog SHALL explicitly explain that recovery is impossible because the system never stores personal information, not merely that "we cannot help you."

#### Scenario: Reset dialog copy
- **WHEN** the user taps "Reset Identity" and the confirmation Alert is displayed
- **THEN** the alert message SHALL state that identity recovery is impossible because no personal information is stored, and advise the user to have their secret written down before proceeding
