## MODIFIED Requirements

### Requirement: Auto-group mutation execution
The system SHALL call the `autoGroupPhotosIntoWaves(uuid: String!)` GraphQL mutation in a loop to group ungrouped photos into waves one wave at a time. Each call returns `{ waveUuid: String, name: String, photosGrouped: Int!, photosRemaining: Int!, hasMore: Boolean! }`. The loop SHALL continue while `hasMore` is `true`.

#### Scenario: Successful auto-group with results
- **WHEN** the user confirms the auto-group action
- **THEN** the system SHALL call the `autoGroupPhotosIntoWaves` mutation
- **THEN** for each call where `hasMore` is `true`, the system SHALL prepend the new wave to the waves list and continue calling
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
