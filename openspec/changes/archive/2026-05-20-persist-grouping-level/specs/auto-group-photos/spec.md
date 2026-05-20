## MODIFIED Requirements

### Requirement: Auto-group uses configured grouping level
The system SHALL call the `autoGroupPhotosIntoWaves(uuid: String!, groupingLevel: GroupingLevel!)` GraphQL mutation with the **persisted** `groupingLevel` value from the user's settings. The `groupingLevel` SHALL be read from `groupingAtom` which is hydrated from AsyncStorage at app startup. If the atom is not yet hydrated, the default value `CITY` SHALL be used as fallback.

#### Scenario: Auto-group uses persisted grouping level after restart
- **WHEN** the user sets grouping level to "DISTRICT" in Settings, closes the app, and restarts it
- **THEN** `groupingAtom` SHALL be hydrated from AsyncStorage with `groupingLevel: "DISTRICT"` during app startup
- **THEN** when the user triggers auto-group, the mutation SHALL be called with `groupingLevel: "DISTRICT"`

#### Scenario: Auto-group uses configured grouping level
- **WHEN** the user triggers auto-group with grouping level set to "DISTRICT" in settings
- **THEN** the `autoGroupPhotosIntoWaves` mutation SHALL be called with `groupingLevel: "DISTRICT"`
- **THEN** the server SHALL use DISTRICT-level matching (district + locality + region + country)

#### Scenario: Auto-group uses CITY grouping level (default)
- **WHEN** the user triggers auto-group with grouping level set to "CITY" (default)
- **THEN** the `autoGroupPhotosIntoWaves` mutation SHALL be called with `groupingLevel: "CITY"`
- **THEN** the server SHALL use CITY-level matching (locality + region + country)

#### Scenario: Auto-group uses REGION grouping level
- **WHEN** the user triggers auto-group with grouping level set to "REGION" in settings
- **THEN** the `autoGroupPhotosIntoWaves` mutation SHALL be called with `groupingLevel: "REGION"`
- **THEN** the server SHALL use REGION-level matching (region + country)

#### Scenario: Auto-group uses COUNTRY grouping level
- **WHEN** the user triggers auto-group with grouping level set to "COUNTRY" in settings
- **THEN** the `autoGroupPhotosIntoWaves` mutation SHALL be called with `groupingLevel: "COUNTRY"`
- **THEN** the server SHALL use COUNTRY-level matching (country only)

#### Scenario: Grouping level change creates new wave
- **WHEN** the user changes grouping level from "CITY" to "DISTRICT" and triggers auto-group
- **THEN** the server SHALL detect the grouping level change
- **THEN** the server SHALL create a new wave with `groupingLevel: "DISTRICT"` stored on it
- **THEN** the server SHALL deactivate the previous active wave

#### Scenario: Auto-group mutation fails without grouping level
- **WHEN** the `groupingLevel` parameter is not provided
- **THEN** the server SHALL fall back to the default grouping level "CITY"
- **THEN** the system SHALL NOT crash or show an error

#### Scenario: Settings UI reflects persisted value after restart
- **WHEN** the user sets grouping level to "DISTRICT", closes and restarts the app
- **THEN** the Grouping Settings screen SHALL display "Near (DISTRICT)" as selected
- **THEN** the `groupingAtom.groupingLevel` SHALL equal `"DISTRICT"` before any user interaction
