## MODIFIED Requirements

### Requirement: Auto-group mutation execution
The system SHALL call the `autoGroupPhotosIntoWaves(uuid: String!)` GraphQL mutation in a loop to group ungrouped photos into waves one wave at a time. Each call returns `{ waveUuid: String, name: String, photosGrouped: Int!, photosRemaining: Int!, hasMore: Boolean! }`. The loop SHALL continue while `hasMore` is `true`. During execution, a progress overlay SHALL be displayed.

#### Scenario: Progress overlay appears during auto-group
- **WHEN** the user confirms the auto-group action
- **THEN** a semi-transparent modal overlay SHALL appear with an ActivityIndicator and progress text
- **THEN** the overlay SHALL block interaction with the underlying UI

#### Scenario: Progress overlay updates after each batch
- **WHEN** a batch completes (each `autoGroupPhotosIntoWaves` call returns)
- **THEN** the overlay text SHALL update to show the running total of photos grouped and waves created
- **THEN** the text format SHALL be: "N photos grouped" on one line and "M waves created" on a second line

#### Scenario: Progress overlay dismisses on completion
- **WHEN** the auto-group loop finishes (either all batches complete or an error occurs)
- **THEN** the progress overlay SHALL be dismissed
- **THEN** the success or error toast SHALL appear as before

#### Scenario: Successful auto-group with results
- **WHEN** the user confirms the auto-group action
- **THEN** the system SHALL call the `autoGroupPhotosIntoWaves` mutation
- **THEN** for each call where `hasMore` is `true`, the system SHALL continue calling
- **THEN** when `hasMore` is `false`, the loop SHALL stop
- **THEN** the system SHALL display a success toast showing the total number of waves created and total photos grouped
- **THEN** the system SHALL refresh the waves list

#### Scenario: Successful auto-group with no ungrouped photos
- **WHEN** the first mutation call returns `hasMore: false` and `photosGrouped: 0`
- **THEN** the system SHALL display an informational toast indicating no ungrouped photos were found
- **THEN** the waves list SHALL remain unchanged

#### Scenario: Auto-group mutation failure mid-loop
- **WHEN** a mutation call fails with an error after one or more waves have been created
- **THEN** the system SHALL stop the loop
- **THEN** the system SHALL display an error toast that includes how many waves were successfully created
- **THEN** the system SHALL refresh the waves list to reflect partial results

#### Scenario: Auto-group mutation failure on first call
- **WHEN** the first mutation call fails with an error
- **THEN** the system SHALL display an error toast with the error message
- **THEN** the waves list SHALL remain unchanged
