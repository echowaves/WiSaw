## ADDED Requirements

### Requirement: WaveDetail reads global network atom
The WaveDetail screen SHALL read `STATE.netAvailable` via `useAtom` instead of creating its own `NetInfo.addEventListener` subscription. It SHALL remove the local `netAvailable` state and `NetInfo` listener effect.

#### Scenario: WaveDetail uses atom for network state
- **WHEN** the WaveDetail component renders
- **THEN** it SHALL read `STATE.netAvailable` via `useAtom`
- **THEN** it SHALL NOT import `NetInfo` or subscribe to `NetInfo.addEventListener`

### Requirement: WaveDetail offline card
The WaveDetail screen SHALL show an offline card when `netAvailable` is `false`.

#### Scenario: WaveDetail renders offline card
- **WHEN** `netAvailable` is `false`
- **THEN** the WaveDetail screen SHALL display an `EmptyStateCard` with `icon='wifi-off'`
- **THEN** it SHALL NOT fire API calls to load wave photos
