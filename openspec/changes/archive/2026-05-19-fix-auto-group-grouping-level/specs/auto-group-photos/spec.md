## MODIFIED Requirements

### Requirement: Auto-group mutation execution
The system SHALL call the `autoGroupPhotosIntoWaves(uuid: String!, groupingLevel: GroupingLevel!)` GraphQL mutation in a loop to group ungrouped photos into waves one wave at a time. Each call returns `{ waveUuid: String, name: String, photosGrouped: Int!, photosRemaining: Int!, hasMore: Boolean! }`. The loop SHALL continue while `hasMore` is `true`. **The `groupingLevel` parameter SHALL be read from the user's configured grouping settings (`groupingAtom.groupingLevel`) at the time of each call.** During execution, a progress overlay SHALL be displayed.

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

#### Scenario: Progress overlay updates after each batch
- **WHEN** a batch completes (each `autoGroupPhotosIntoWaves` call returns)
- **THEN** the overlay text SHALL update to show the running total of photos grouped and waves created
- **THEN** the text format SHALL be: "N photos grouped" on one line and "M waves created" on a second line

#### Scenario: Successful auto-group with results
- **WHEN** the user confirms the auto-group action
- **THEN** the system SHALL call the `autoGroupPhotosIntoWaves` mutation with the configured `groupingLevel`
- **THEN** for each call where `hasMore` is `true`, the system SHALL continue calling
- **THEN** when `hasMore` is `false`, the loop SHALL stop
- **THEN** the system SHALL display a success toast showing the total number of waves created and total photos grouped
- **THEN** the system SHALL refresh the waves list

#### Scenario: Auto-group mutation failure mid-loop
- **WHEN** a mutation call fails with an error after one or more waves have been created
- **THEN** the system SHALL stop the loop
- **THEN** the system SHALL display an error toast that includes how many waves were successfully created
- **THEN** the system SHALL refresh the waves list to reflect partial results
