## ADDED Requirements

### Requirement: WavesHub offline card
The WavesHub screen SHALL read `STATE.netAvailable` via `useAtom`. When `netAvailable` is `false`, it SHALL display an `EmptyStateCard` with `icon='wifi-off'` instead of attempting to load waves.

#### Scenario: WavesHub renders offline card
- **WHEN** `netAvailable` is `false`
- **THEN** the WavesHub screen SHALL display an offline `EmptyStateCard`
- **THEN** it SHALL NOT call `reducer.listWaves()` or any other GraphQL operation

#### Scenario: WavesHub loads normally when online
- **WHEN** `netAvailable` is `true`
- **THEN** the WavesHub screen SHALL render its normal waves list
