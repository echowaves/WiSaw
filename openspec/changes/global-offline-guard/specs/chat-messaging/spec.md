## ADDED Requirements

### Requirement: Chat offline card
The Chat screen SHALL read `STATE.netAvailable` via `useAtom`. When `netAvailable` is `false`, it SHALL display an `EmptyStateCard` with `icon='wifi-off'` instead of attempting to load messages or connect WebSocket subscriptions.

#### Scenario: Chat renders offline card
- **WHEN** `netAvailable` is `false`
- **THEN** the Chat screen SHALL display an offline `EmptyStateCard`
- **THEN** it SHALL NOT fire GraphQL queries or establish WebSocket subscriptions

#### Scenario: Chat loads normally when online
- **WHEN** `netAvailable` is `true`
- **THEN** the Chat screen SHALL render its normal messaging interface
