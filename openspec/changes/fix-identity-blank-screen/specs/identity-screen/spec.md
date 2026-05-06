## ADDED Requirements

### Requirement: Identity screen content renders immediately

The identity screen SHALL render its content immediately without fade-in animation. The screen content (profile card, form fields, privacy explainer) SHALL be visible as soon as the component mounts and data is available.

#### Scenario: Screen loads with existing identity
- **WHEN** a user with an attached identity navigates to the identity screen
- **THEN** the profile card and action rows SHALL be visible immediately without animation delay

#### Scenario: Screen loads without identity
- **WHEN** a user without an identity navigates to the identity screen
- **THEN** the creation form (or privacy explainer if not yet seen) SHALL be visible immediately without animation delay
