## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for user identity in WiSaw.

## MODIFIED Requirements

## Requirements

### Requirement: Identity Management Screen
The system SHALL provide an identity screen with two distinct visual states: a creation flow when no identity exists, and an active-identity profile view when an identity is established.

#### Scenario: User opens identity screen with no identity
- **WHEN** the user navigates to the identity screen from the drawer menu and has no stored nickname
- **THEN** the system SHALL display a creation flow with an icon circle, title "Create Your Anonymous Identity", subtitle text, and inline form fields for nickname, secret, and secret confirmation

#### Scenario: User opens identity screen with established identity
- **WHEN** the user navigates to the identity screen from the drawer menu and has a stored nickname
- **THEN** the system SHALL display an `IdentityProfileCard` showing the nickname and identity status, followed by action rows for "Change Secret" and "Reset Identity"

#### Scenario: Creation flow uses EmptyStateCard visual pattern
- **WHEN** the identity creation flow renders
- **THEN** it SHALL use the same visual language as `EmptyStateCard` — centered card with icon circle (`borderRadius: 60`, orange-tinted background), heading text, subtitle, and themed card styling (`CARD_BACKGROUND`, `borderRadius: 24`, shadows)

#### Scenario: Active identity view uses card-based layout
- **WHEN** the active identity view renders
- **THEN** all sections SHALL use card-based layouts with `borderRadius: 16`, `theme.CARD_BACKGROUND`, `theme.CARD_SHADOW`, and `theme.BORDER_LIGHT` consistent with the Waves feature styling
