### Requirement: Global wave count atoms
The system SHALL maintain two Jotai atoms in `src/state.js` — `wavesCount` and `ungroupedPhotosCount` — both defaulting to `null`. These atoms provide global wave state readable by any component.

#### Scenario: Atoms default to null before first fetch
- **WHEN** the app starts and no fetch has occurred
- **THEN** `wavesCount` SHALL be `null`
- **THEN** `ungroupedPhotosCount` SHALL be `null`

#### Scenario: Initial eager fetch sets atoms
- **WHEN** the WaveHeaderIcon mounts and `wavesCount` is `null` and `uuid` is non-empty
- **THEN** the system SHALL call `getWavesCount({ uuid })` and `getUngroupedPhotosCount({ uuid })` in parallel
- **THEN** the results SHALL be written to the `wavesCount` and `ungroupedPhotosCount` atoms respectively

#### Scenario: Subsequent mounts skip fetch
- **WHEN** the WaveHeaderIcon mounts and `wavesCount` is not `null`
- **THEN** no backend fetch SHALL occur
- **THEN** the current atom values SHALL be used directly

### Requirement: Local atom updates at mutation sites
The system SHALL update `wavesCount` and `ungroupedPhotosCount` atoms directly at mutation call sites, without additional backend queries.

#### Scenario: Photo uploaded without wave assignment
- **WHEN** a photo upload completes and `waveUuid` is undefined
- **THEN** `ungroupedPhotosCount` SHALL be incremented by 1

#### Scenario: Photo uploaded to a specific wave
- **WHEN** a photo upload completes and `waveUuid` is defined
- **THEN** `ungroupedPhotosCount` SHALL NOT change

#### Scenario: Auto-group completes
- **WHEN** the auto-group process finishes with `totalWavesCreated` waves
- **THEN** `ungroupedPhotosCount` SHALL be set to 0
- **THEN** `wavesCount` SHALL be incremented by `totalWavesCreated`

#### Scenario: Wave created manually
- **WHEN** a new wave is successfully created via the create-wave modal
- **THEN** `wavesCount` SHALL be incremented by 1

#### Scenario: Wave deleted
- **WHEN** a wave with `photosCount` photos is successfully deleted
- **THEN** `wavesCount` SHALL be decremented by 1
- **THEN** `ungroupedPhotosCount` SHALL be incremented by the deleted wave's `photosCount`

#### Scenario: Photo added to wave manually
- **WHEN** a photo is successfully added to a wave via `addPhotoToWave`
- **THEN** `ungroupedPhotosCount` SHALL be decremented by 1 (floored at 0)

### Requirement: Focus refresh re-syncs atoms
The system SHALL re-fetch both `getWavesCount` and `getUngroupedPhotosCount` from the backend when the waves screen gains focus, writing the results to the global atoms to correct any drift.

#### Scenario: Waves screen gains focus
- **WHEN** the waves index screen gains focus via `useFocusEffect`
- **THEN** the system SHALL call `getWavesCount({ uuid })` and `getUngroupedPhotosCount({ uuid })`
- **THEN** the results SHALL be written to the `wavesCount` and `ungroupedPhotosCount` atoms

### Requirement: getWavesCount reducer function
The system SHALL provide a `getWavesCount` function in `src/screens/Waves/reducer.js` that queries the `getWavesCount(uuid)` GraphQL query and returns the integer result.

#### Scenario: Successful query
- **WHEN** `getWavesCount({ uuid })` is called with a valid uuid
- **THEN** it SHALL execute the `getWavesCount` GraphQL query
- **THEN** it SHALL return the integer count from `response.data.getWavesCount`
