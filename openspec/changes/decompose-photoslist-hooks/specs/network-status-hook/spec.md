## ADDED Requirements

### Requirement: useNetworkStatus hook encapsulates network monitoring
The `useNetworkStatus` hook SHALL subscribe to NetInfo state changes and expose a `netAvailable` boolean.

#### Scenario: Hook returns network state
- **WHEN** `useNetworkStatus` is called with no arguments
- **THEN** it SHALL return `{ netAvailable }`

### Requirement: Network availability combines connected and reachable
The hook SHALL compute availability as `state.isConnected && state.isInternetReachable !== false`.

#### Scenario: Device connected with internet
- **WHEN** NetInfo reports `isConnected: true` and `isInternetReachable: true`
- **THEN** `netAvailable` SHALL be true

#### Scenario: Device connected without internet
- **WHEN** NetInfo reports `isConnected: true` and `isInternetReachable: false`
- **THEN** `netAvailable` SHALL be false

#### Scenario: Device disconnected
- **WHEN** NetInfo reports `isConnected: false`
- **THEN** `netAvailable` SHALL be false

### Requirement: Cleanup on unmount
The hook SHALL unsubscribe from NetInfo when the component unmounts.

#### Scenario: Component unmounts
- **WHEN** the component using the hook unmounts
- **THEN** the NetInfo subscription SHALL be removed
