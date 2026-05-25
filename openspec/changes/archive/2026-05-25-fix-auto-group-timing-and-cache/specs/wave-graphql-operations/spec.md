## MODIFIED Requirements

### Requirement: Update listWaves query to include new fields
The frontend `listWaves` query SHALL request the `freezeMode` field from the backend in addition to existing Wave fields. The query SHALL NOT request the `isActive` field, which has been removed from the backend Wave type. The query SHALL use `fetchPolicy: 'network-only'` to ensure fresh data on every call.

#### Scenario: List waves returns extended fields
- **WHEN** `listWaves` is called
- **THEN** the query SHALL request `open`, `frozen`, `startDate`, `endDate`, `isFrozen`, `freezeMode`, `myRole`, `joinUrl`, `location`, `radius` in addition to existing fields
- **THEN** the query SHALL NOT request `isActive`

#### Scenario: List waves always fetches from network
- **WHEN** `listWaves` is called
- **THEN** the Apollo query SHALL use `fetchPolicy: 'network-only'`
- **THEN** the query SHALL NOT return cached results from a previous call

## ADDED Requirements

### Requirement: Ungrouped photos count uses network-only fetch
The `getUngroupedPhotosCount` query SHALL use `fetchPolicy: 'network-only'` to ensure fresh counts on every call.

#### Scenario: Ungrouped count always fetches from network
- **WHEN** `getUngroupedPhotosCount` is called
- **THEN** the Apollo query SHALL use `fetchPolicy: 'network-only'`
- **THEN** the count SHALL reflect the current server state, not a cached value

### Requirement: Waves count uses network-only fetch
The `getWavesCount` query SHALL use `fetchPolicy: 'network-only'` to ensure fresh counts on every call.

#### Scenario: Waves count always fetches from network
- **WHEN** `getWavesCount` is called
- **THEN** the Apollo query SHALL use `fetchPolicy: 'network-only'`
- **THEN** the count SHALL reflect the current server state, not a cached value
