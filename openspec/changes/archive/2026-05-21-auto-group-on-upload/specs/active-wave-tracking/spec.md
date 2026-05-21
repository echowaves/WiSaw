## ADDED Requirements

### Requirement: Active wave state management
The system SHALL maintain a Jotai atom `activeWaveAtom` holding `{ waveUuid: string, name: string } | null` representing the user's current active wave (the wave that receives auto-grouped photos). The atom SHALL be hydrated from AsyncStorage on app startup. When no cached value exists, the atom SHALL remain `null` until the Waves screen loads and identifies the active wave from `listWaves` results.

#### Scenario: App startup with cached active wave
- **WHEN** the app starts and AsyncStorage contains a cached active wave value
- **THEN** `activeWaveAtom` SHALL be hydrated with `{ waveUuid, name }` from the cache
- **THEN** no network request SHALL be required for hydration

#### Scenario: App startup without cached active wave
- **WHEN** the app starts and AsyncStorage has no cached active wave value
- **THEN** `activeWaveAtom` SHALL be `null`
- **THEN** the system SHALL resolve the active wave from `listWaves` on the next Waves screen visit

#### Scenario: Active wave resolved from listWaves
- **WHEN** the Waves screen fetches `listWaves` and a wave with `isActive: true` exists
- **THEN** `activeWaveAtom` SHALL be updated with that wave's `{ waveUuid, name }`
- **THEN** the value SHALL be persisted to AsyncStorage

#### Scenario: No active wave in listWaves
- **WHEN** the Waves screen fetches `listWaves` and no wave has `isActive: true`
- **THEN** `activeWaveAtom` SHALL be set to `null`
- **THEN** AsyncStorage SHALL be cleared of any cached active wave

### Requirement: Active wave updated on auto-group
The system SHALL update `activeWaveAtom` when `autoGroupPhotosIntoWaves` returns `isNewWave: true`, persisting the new active wave to AsyncStorage.

#### Scenario: Auto-group creates a new wave
- **WHEN** `autoGroupPhotosIntoWaves` returns with `isNewWave: true`
- **THEN** `activeWaveAtom` SHALL be updated with the returned `{ waveUuid, name }`
- **THEN** the new value SHALL be persisted to AsyncStorage

#### Scenario: Auto-group adds to existing wave
- **WHEN** `autoGroupPhotosIntoWaves` returns with `isNewWave: false`
- **THEN** `activeWaveAtom` SHALL NOT be changed

#### Scenario: Active wave deleted by user
- **WHEN** the user deletes the wave that is currently the active wave
- **THEN** `activeWaveAtom` SHALL be set to `null`
- **THEN** AsyncStorage SHALL be cleared of the cached active wave

### Requirement: Active wave persistence
The system SHALL persist the active wave to AsyncStorage using a dedicated storage utility (`activeWaveStorage.js`) following the same pattern as `groupingStorage.js`.

#### Scenario: Save active wave
- **WHEN** `activeWaveAtom` is updated with a non-null value
- **THEN** `{ waveUuid, name }` SHALL be serialized as JSON and saved to AsyncStorage under key `@activeWave`

#### Scenario: Clear active wave
- **WHEN** `activeWaveAtom` is set to `null`
- **THEN** the `@activeWave` key SHALL be removed from AsyncStorage

#### Scenario: Load active wave on startup
- **WHEN** `hydrateActiveWaveAtom()` is called during app startup
- **THEN** the function SHALL read and parse the `@activeWave` key from AsyncStorage
- **THEN** if the key exists and contains valid JSON, the parsed value SHALL be returned
- **THEN** if the key does not exist or contains invalid JSON, `null` SHALL be returned
