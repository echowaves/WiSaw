## ADDED Requirements

### Requirement: Facilitator identity gate
The app SHALL prevent facilitators from performing moderation duties until they have established an identity (registered a secret) on the device.

#### Scenario: Facilitator without identity opens moderation
- **WHEN** a facilitator without a registered identity navigates to the moderation dashboard or attempts a moderation action
- **THEN** the app SHALL display an inline card with an icon, a title "Identity Required", and body text explaining that moderators must have an identity for accountability
- **THEN** the card SHALL include a "Create Identity" button that navigates to the Identity screen

#### Scenario: Facilitator creates identity and returns
- **WHEN** a facilitator navigates to the Identity screen from the moderation gate, creates an identity, and returns
- **THEN** the moderation actions SHALL become available
- **THEN** the identity gate card SHALL no longer appear

#### Scenario: Facilitator with existing identity
- **WHEN** a facilitator with a registered identity opens the moderation dashboard
- **THEN** the moderation dashboard SHALL render normally without the identity gate

### Requirement: Identity check mechanism
The facilitator identity gate SHALL check for an existing identity using the same mechanism as the Identity screen (checking for stored nickname in expo-secure-store).

#### Scenario: Identity check uses stored nickname
- **WHEN** the app checks whether a facilitator has an identity
- **THEN** the check SHALL read the stored nickname from secure storage
- **THEN** if a nickname exists, the facilitator is considered to have an identity
