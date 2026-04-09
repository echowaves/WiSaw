## MODIFIED Requirements

### Requirement: User creates a new wave from modal
The wave selector modal SHALL support optional location and radius fields during wave creation.

#### Scenario: User creates a new wave with location
- **WHEN** the user taps "Create New Wave" and enters a wave name
- **AND** the user optionally sets a location via "Use My Location" or address input
- **AND** the user optionally adjusts the radius slider
- **WHEN** the user submits
- **THEN** the `onCreateWave` callback SHALL be called with the entered name and optional `lat`, `lon`, `radius` parameters
- **THEN** the modal closes

#### Scenario: User creates a wave without location
- **WHEN** the user taps "Create New Wave" and enters a wave name without setting a location
- **WHEN** the user submits
- **THEN** the `onCreateWave` callback SHALL be called with only the name (no location params)
- **THEN** the modal closes

#### Scenario: Location fields visibility during creation
- **WHEN** the user taps "Create New Wave" and the inline input is shown
- **THEN** a "Set Location (optional)" expandable section SHALL appear below the name input
- **AND** the section SHALL be collapsed by default
- **WHEN** the user taps to expand
- **THEN** the "Use My Location" button, address input, and radius slider SHALL appear
