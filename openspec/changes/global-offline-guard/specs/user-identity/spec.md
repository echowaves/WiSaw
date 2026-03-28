## ADDED Requirements

### Requirement: Secret screen offline card
The Secret (Identity) screen SHALL read `STATE.netAvailable` via `useAtom`. When `netAvailable` is `false`, it SHALL display an `EmptyStateCard` with `icon='wifi-off'` instead of allowing identity operations that require the network.

#### Scenario: Secret renders offline card
- **WHEN** `netAvailable` is `false`
- **THEN** the Secret screen SHALL display an offline `EmptyStateCard`
- **THEN** it SHALL NOT attempt network-dependent identity operations

#### Scenario: Secret loads normally when online
- **WHEN** `netAvailable` is `true`
- **THEN** the Secret screen SHALL render its normal identity management interface
