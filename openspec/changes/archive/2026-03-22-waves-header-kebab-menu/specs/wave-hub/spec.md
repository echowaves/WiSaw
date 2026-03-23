## ADDED Requirements

### Requirement: WavesHub Subscribes to AddWave Event
The system SHALL subscribe to the `addWave` event in WavesHub so that the header kebab menu can trigger the create-wave modal.

#### Scenario: Header menu emits addWave event
- **WHEN** the user selects "Create New Wave" from the Waves header kebab menu
- **THEN** `emitAddWave()` SHALL be called
- **THEN** WavesHub SHALL receive the event via `subscribeToAddWave`
- **THEN** WavesHub SHALL set `modalVisible` to true, opening the existing create-wave modal

#### Scenario: AddWave subscription cleanup
- **WHEN** WavesHub unmounts
- **THEN** the `subscribeToAddWave` listener SHALL be unsubscribed to prevent memory leaks
