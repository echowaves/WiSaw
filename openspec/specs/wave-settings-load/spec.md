## ADDED Requirements

### Requirement: getWave query function
The waves reducer SHALL export a `getWave` function that executes the GraphQL query `getWave(waveUuid: String!, uuid: String!): Wave` and returns the Wave object.

#### Scenario: Successful wave fetch
- **WHEN** `getWave({ waveUuid, uuid })` is called with valid parameters
- **THEN** the function SHALL return the Wave object with fields: `waveUuid`, `name`, `description`, `createdAt`, `updatedAt`, `createdBy`, `open`, `splashDate`, `freezeDate`, `isFrozen`, `myRole`, `joinUrl`, `location`, `radius`

#### Scenario: Network or server error
- **WHEN** the GraphQL query fails
- **THEN** the function SHALL log the error and re-throw it

#### Scenario: Fresh data on every call
- **WHEN** `getWave` is called
- **THEN** the query SHALL use `fetchPolicy: 'network-only'` to bypass Apollo cache

### Requirement: WaveSettings loads via getWave query
The WaveSettings `loadSettings` function SHALL use the `getWave` query instead of `updateWave` to load the current wave state.

#### Scenario: Loading settings for a non-frozen wave
- **WHEN** WaveSettings opens for a wave that is not frozen
- **THEN** `loadSettings` SHALL call `getWave({ waveUuid, uuid })` and populate `isOpen`, `isFrozen`, `splashDate`, `freezeDate`, `location`, and `radius` state from the response

#### Scenario: Loading settings for a frozen wave
- **WHEN** WaveSettings opens for a wave that is frozen (`isFrozen === true`)
- **THEN** `loadSettings` SHALL successfully load and display the wave settings without error

#### Scenario: Load failure
- **WHEN** `getWave` fails during `loadSettings`
- **THEN** WaveSettings SHALL display an error toast with the error message

#### Scenario: Location data loaded and reverse-geocoded
- **WHEN** WaveSettings loads a wave that has a `location` field (AWSJSON with lat/lon)
- **THEN** the system SHALL parse the location JSON, reverse-geocode the coordinates, and display the location text
- **AND** convert the `radius` from meters to miles for the slider

#### Scenario: Wave has no location
- **WHEN** WaveSettings loads a wave with no `location` field (null)
- **THEN** the location display SHALL show "No location set" and the radius slider SHALL be hidden
