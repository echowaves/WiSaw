## ADDED Requirements

### Requirement: Feedback screen offline card
The Feedback screen SHALL read `STATE.netAvailable` via `useAtom`. When `netAvailable` is `false`, it SHALL display an `EmptyStateCard` with `icon='wifi-off'` instead of showing the feedback form, preventing users from typing feedback that cannot be submitted.

#### Scenario: Feedback renders offline card
- **WHEN** `netAvailable` is `false`
- **THEN** the Feedback screen SHALL display an offline `EmptyStateCard`
- **THEN** it SHALL NOT render the feedback form

#### Scenario: Feedback loads normally when online
- **WHEN** `netAvailable` is `true`
- **THEN** the Feedback screen SHALL render its normal feedback form
