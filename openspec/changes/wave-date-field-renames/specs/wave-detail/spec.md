## MODIFIED Requirements

### Requirement: Wave GraphQL Field Names
The `listWaves` query, `createWave` mutation, and `updateWave` mutation SHALL request and send the following renamed fields in their GraphQL operations:
- `splashDate` (previously `startDate`): the date when the wave goes live
- `freezeDate` (previously `endDate`): the date when the wave auto-freezes
- `isFrozen` (retained): computed boolean indicating wave is currently frozen

The operations SHALL NOT request or send the removed fields: `frozen`, `startDate`, `endDate`, `isActive`.

#### Scenario: listWaves uses renamed fields
- **WHEN** the `listWaves` query is executed
- **THEN** the query SHALL request `splashDate`, `freezeDate`, and `isFrozen` on each wave
- **THEN** the query SHALL NOT request `frozen`, `startDate`, `endDate`, or `isActive`

#### Scenario: createWave response uses renamed fields
- **WHEN** the `createWave` mutation returns a wave
- **THEN** the response SHALL request `splashDate`, `freezeDate`, and `isFrozen`
- **THEN** the response SHALL NOT request `frozen`, `startDate`, `endDate`, or `isActive`

#### Scenario: updateWave sends renamed fields
- **WHEN** the `updateWave` function is called with scheduling parameters
- **THEN** it SHALL send `splashDate` (not `startDate`) and `freezeDate` (not `endDate`) as GraphQL variables
- **THEN** it SHALL NOT send a `frozen` variable
- **THEN** the mutation declaration SHALL use `$splashDate: AWSDateTime` and `$freezeDate: AWSDateTime` parameter types

### Requirement: WaveSettings Freeze Model
The WaveSettings screen SHALL NOT render an explicit freeze/unfreeze toggle switch. Wave freezing SHALL be controlled exclusively through the `freezeDate` date picker. When `isFrozen` is `true`, all settings except the `freezeDate` picker SHALL be disabled. The `freezeDate` picker SHALL remain active when frozen so the owner can set a future date to unfreeze the wave. The frozen banner SHALL display when `isFrozen` is `true`.

#### Scenario: No freeze toggle displayed
- **WHEN** the WaveSettings screen renders
- **THEN** there SHALL be no switch labeled "Freeze Wave"
- **THEN** the only freeze-related control SHALL be the freeze date picker

#### Scenario: Frozen wave disables all controls except freeze date
- **WHEN** `isFrozen` is `true`
- **THEN** the frozen banner SHALL display with a snowflake icon
- **THEN** the "Open Wave" toggle SHALL be disabled
- **THEN** the "Splash Date" picker SHALL be disabled
- **THEN** the "Freeze Date" picker SHALL remain enabled

#### Scenario: User unfreezes wave by setting future freeze date
- **WHEN** `isFrozen` is `true`
- **THEN** the user taps the freeze date picker and selects a future date
- **THEN** `updateWave` is called with `freezeDate` set to the selected future date
- **THEN** the wave becomes unfrozen and all controls re-enable

#### Scenario: User clears freeze date on unfrozen wave
- **WHEN** `isFrozen` is `false` and a `freezeDate` is set
- **THEN** the user taps the clear button on the freeze date
- **THEN** `updateWave` is called with `freezeDate: null`
- **THEN** the wave will not auto-freeze

### Requirement: WaveSettings Date Labels
The WaveSettings screen SHALL label the date pickers as "Splash Date" (with description "Wave goes live on this date") and "Freeze Date" (with description "Wave auto-freezes after this date"). State variables, handlers, and UI text SHALL use `splashDate`/`freezeDate` naming consistently.

#### Scenario: Date picker labels
- **WHEN** the WaveSettings screen renders
- **THEN** the first date section SHALL show title "Splash Date" with description "Wave goes live on this date"
- **THEN** the second date section SHALL show title "Freeze Date" with description "Wave auto-freezes after this date"

### Requirement: WaveSettings Load Settings
The WaveSettings screen SHALL derive its initial state from a wave object, reading `isFrozen` for the frozen banner and `splashDate`/`freezeDate` for date values. It SHALL NOT read `frozen`, `isActive`, `startDate`, or `endDate`.

#### Scenario: Settings loaded from wave response
- **WHEN** the WaveSettings screen loads
- **THEN** `isFrozen` SHALL be set from `wave.isFrozen`
- **THEN** the splash date SHALL be set from `wave.splashDate`
- **THEN** the freeze date SHALL be set from `wave.freezeDate`
- **THEN** the screen SHALL NOT reference `wave.frozen`, `wave.startDate`, `wave.endDate`, or `wave.isActive`
