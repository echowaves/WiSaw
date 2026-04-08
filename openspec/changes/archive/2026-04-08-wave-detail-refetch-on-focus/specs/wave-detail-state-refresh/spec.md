## ADDED Requirements

### Requirement: Wave metadata refreshes on screen focus
The WaveDetail route screen SHALL re-fetch wave metadata (`isFrozen`, `myRole`) from the backend every time the screen gains focus.

#### Scenario: Returning from WaveSettings after unfreezing
- **WHEN** the user navigates to WaveSettings, changes the freeze date to unfreeze the wave, and returns to WaveDetail
- **THEN** the frozen banner, header snowflake icon, and edit restrictions SHALL update to reflect the unfrozen state

#### Scenario: Returning from WaveSettings after freezing
- **WHEN** the user navigates to WaveSettings, sets a freeze date that makes the wave frozen, and returns to WaveDetail
- **THEN** the frozen banner and header snowflake icon SHALL appear and edit restrictions SHALL be enforced

#### Scenario: Initial navigation to WaveDetail
- **WHEN** the user navigates to WaveDetail from WavesHub or any other screen
- **THEN** the screen SHALL render immediately using route params and then validate state against the backend via `getWave`

### Requirement: No loading flash on initial render
The WaveDetail route screen SHALL use navigation params as initial state values so the screen renders immediately without a loading indicator.

#### Scenario: First render uses route params
- **WHEN** the user navigates to WaveDetail with `isFrozen` and `myRole` route params
- **THEN** the header and WaveDetail component SHALL render using those values before the `getWave` response arrives

### Requirement: Silent failure on refetch error
The WaveDetail route screen SHALL silently retain current state if the `getWave` refetch fails due to network or server errors.

#### Scenario: Network error during refetch
- **WHEN** the screen gains focus and `getWave` fails
- **THEN** the screen SHALL continue displaying the previously known state without showing an error to the user
