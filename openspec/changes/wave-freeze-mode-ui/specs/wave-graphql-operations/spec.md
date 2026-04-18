## MODIFIED Requirements

### Requirement: Update updateWave to include all settings
The frontend `updateWave` function SHALL accept optional `open`, `frozen`, `startDate`, `endDate`, `freezeMode`, `lat`, `lon`, and `radius` parameters and pass them to the GraphQL mutation.

#### Scenario: Update wave with all settings
- **WHEN** `updateWave` is called with any combination of settings parameters including `freezeMode`
- **THEN** the GraphQL mutation SHALL include all provided parameters
- **THEN** the mutation response SHALL include all Wave fields including `open`, `frozen`, `startDate`, `endDate`, `isFrozen`, `freezeMode`, `isActive`, `myRole`, `joinUrl`, `location`, `radius`

#### Scenario: Update wave freeze mode only
- **WHEN** `updateWave` is called with `freezeMode: "FROZEN"` and no other parameters
- **THEN** the GraphQL mutation SHALL send `freezeMode` as a variable
- **THEN** the mutation response SHALL reflect the updated freeze state

### Requirement: Update listWaves query to include new fields
The frontend `listWaves` query SHALL request the `freezeMode` field from the backend in addition to existing Wave fields.

#### Scenario: List waves returns extended fields
- **WHEN** `listWaves` is called
- **THEN** the query SHALL request `open`, `frozen`, `startDate`, `endDate`, `isFrozen`, `freezeMode`, `isActive`, `myRole`, `joinUrl`, `location`, `radius` in addition to existing fields

### Requirement: getWave query function
The waves reducer SHALL export a `getWave` function that includes `freezeMode` in the requested fields.

#### Scenario: Successful wave fetch
- **WHEN** `getWave({ waveUuid, uuid })` is called with valid parameters
- **THEN** the function SHALL return the Wave object with fields including `freezeMode` alongside `waveUuid`, `name`, `description`, `createdAt`, `updatedAt`, `createdBy`, `open`, `splashDate`, `freezeDate`, `isFrozen`, `myRole`, `joinUrl`, `location`, `radius`
