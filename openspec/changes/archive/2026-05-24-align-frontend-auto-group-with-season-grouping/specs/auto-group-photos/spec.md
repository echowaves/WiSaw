## MODIFIED Requirements

### Requirement: Auto-group uses persisted grouping level
The system SHALL call the `autoGroupPhotosIntoWaves(uuid: String!, groupingLevel: GroupingLevel!)` GraphQL mutation with the **persisted** `groupingLevel` value from the user's settings in ALL code paths that trigger auto-grouping, including:
- User-triggered via Waves Hub UI (menu action, explainer view, ungrouped photos card)
- Automatic location-drift trigger
- Post-upload flush (`flushUngroupedPhotos`)

The `groupingLevel` SHALL be read from `groupingAtom` (in React components) or `_groupingState` (in non-React code like `photoUploadService.js`). If the value is not yet hydrated, the default value `CITY` SHALL be used as fallback. The system SHALL NOT hardcode a grouping level in any call site.

#### Scenario: Auto-group uses persisted grouping level after restart
- **WHEN** the user sets grouping level to "DISTRICT" in Settings, closes the app, and restarts it
- **THEN** `groupingAtom` SHALL be hydrated from AsyncStorage with `groupingLevel: "DISTRICT"` during app startup
- **THEN** when the user triggers auto-group, the mutation SHALL be called with `groupingLevel: "DISTRICT"`

#### Scenario: Auto-group uses configured grouping level
- **WHEN** the user triggers auto-group with grouping level set to "DISTRICT" in settings
- **THEN** the `autoGroupPhotosIntoWaves` mutation SHALL be called with `groupingLevel: "DISTRICT"`

#### Scenario: Auto-group uses CITY grouping level (default)
- **WHEN** the user triggers auto-group with grouping level set to "CITY" (default)
- **THEN** the `autoGroupPhotosIntoWaves` mutation SHALL be called with `groupingLevel: "CITY"`

#### Scenario: Auto-group uses REGION grouping level
- **WHEN** the user triggers auto-group with grouping level set to "REGION" in settings
- **THEN** the `autoGroupPhotosIntoWaves` mutation SHALL be called with `groupingLevel: "REGION"`

#### Scenario: Auto-group uses COUNTRY grouping level
- **WHEN** the user triggers auto-group with grouping level set to "COUNTRY" in settings
- **THEN** the `autoGroupPhotosIntoWaves` mutation SHALL be called with `groupingLevel: "COUNTRY"`

#### Scenario: Post-upload auto-group uses configured grouping level
- **WHEN** a photo upload completes and `flushUngroupedPhotos` is called
- **THEN** the mutation SHALL be called with `groupingLevel` from `_groupingState.groupingLevel`
- **AND** SHALL NOT use a hardcoded `'CITY'` value

#### Scenario: Post-upload auto-group falls back to CITY when state not hydrated
- **WHEN** `flushUngroupedPhotos` is called before `_groupingState` is hydrated
- **THEN** the mutation SHALL be called with `groupingLevel: 'CITY'` as a fallback

#### Scenario: Auto-group mutation fails without grouping level
- **WHEN** the `groupingLevel` parameter is not provided
- **THEN** the server SHALL throw an error (no default fallback)
- **AND** the client SHALL display an error toast

#### Scenario: Settings UI reflects persisted value after restart
- **WHEN** the user sets grouping level to "DISTRICT", closes and restarts the app
- **THEN** the Grouping Settings screen SHALL display "Near (DISTRICT)" as selected
- **THEN** the `groupingAtom.groupingLevel` SHALL equal `"DISTRICT"` before any user interaction
