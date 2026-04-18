## MODIFIED Requirements

### Requirement: WaveSettings loads via getWave query
The WaveSettings `loadSettings` function SHALL use the `getWave` query and populate `freezeMode` state in addition to existing fields.

#### Scenario: Loading settings for a wave with freeze mode
- **WHEN** WaveSettings opens for a wave
- **THEN** `loadSettings` SHALL call `getWave({ waveUuid, uuid })` and populate `isOpen`, `isFrozen`, `freezeMode`, `splashDate`, `freezeDate`, `location`, and `radius` state from the response

#### Scenario: Loading settings for a wave without freeze mode
- **WHEN** WaveSettings opens for a wave that does not have a `freezeMode` field (backward compatibility)
- **THEN** `loadSettings` SHALL default `freezeMode` to `"AUTO"`
