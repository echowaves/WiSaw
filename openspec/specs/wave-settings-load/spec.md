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

### Requirement: Compact date picker for date fields
Each date field (splash date, freeze date) in WaveSettings SHALL use a single compact `DateTimePicker` element that combines date display and date editing, instead of separate display label and picker components.

#### Scenario: iOS date display and editing
- **WHEN** a date field has a value set on iOS
- **THEN** the field SHALL render a `DateTimePicker` with `display='compact'` that shows the current date as a tappable label opening a native calendar popover

#### Scenario: Android date display and editing
- **WHEN** a date field has a value set on Android
- **THEN** the field SHALL render a `DateTimePicker` with `display='default'` that opens a modal date picker on tap

#### Scenario: Date not set
- **WHEN** a date field has no value (null)
- **THEN** the field SHALL display a "Set Date" button instead of the picker

#### Scenario: Setting a date for the first time
- **WHEN** the user taps "Set Date" on an unset date field
- **THEN** the date SHALL be initialized to today and saved to the backend, and the compact picker SHALL appear in place of the button

#### Scenario: Clearing a set date
- **WHEN** a date field has a value and the user taps the clear button
- **THEN** the date SHALL be cleared (set to null) on the backend and the "Set Date" button SHALL replace the picker

### Requirement: No picker visibility toggle state
WaveSettings SHALL NOT maintain separate show/hide state for date pickers. The compact picker manages its own popover state internally.

#### Scenario: State variables removed
- **WHEN** WaveSettings renders
- **THEN** there SHALL be no `showSplashPicker` or `showFreezePicker` state variables
