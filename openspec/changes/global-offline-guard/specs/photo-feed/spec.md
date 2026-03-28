## ADDED Requirements

### Requirement: PhotosList reads global network atom
The PhotosList screen SHALL read `STATE.netAvailable` via `useAtom` instead of using the local `useNetworkStatus` hook. The `useNetworkStatus` hook file SHALL be deleted.

#### Scenario: PhotosList uses atom for network state
- **WHEN** the PhotosList component renders
- **THEN** it SHALL read `STATE.netAvailable` via `useAtom`
- **THEN** it SHALL NOT import or call `useNetworkStatus`

### Requirement: getZeroMoment offline guard
The `getZeroMoment()` function SHALL accept a `netAvailable` parameter. When `netAvailable` is `false`, it SHALL return `0` immediately without making a GraphQL call.

#### Scenario: getZeroMoment skips API when offline
- **WHEN** `getZeroMoment` is called with `netAvailable` equal to `false`
- **THEN** it SHALL return `0` without making a GraphQL query
- **THEN** no network error SHALL be logged

#### Scenario: getZeroMoment makes API call when online
- **WHEN** `getZeroMoment` is called with `netAvailable` equal to `true`
- **THEN** it SHALL make the GraphQL query as normal
