### Requirement: Auto-group button on Waves screen
The Waves screen SHALL display an "Auto-Group" action button that allows users to trigger automatic photo grouping into waves.

#### Scenario: Auto-group button is visible
- **WHEN** the user navigates to the Waves screen
- **THEN** an "Auto-Group" button SHALL be visible alongside the existing wave creation button

#### Scenario: Auto-group button is disabled during loading
- **WHEN** the auto-group operation is in progress
- **THEN** the auto-group button SHALL be disabled and display a loading indicator

### Requirement: Confirmation before auto-grouping
The system SHALL display a confirmation dialog before executing the auto-group operation to prevent accidental invocations.

#### Scenario: User confirms auto-group
- **WHEN** the user taps the "Auto-Group" button
- **THEN** the system SHALL display a confirmation dialog asking the user to confirm the operation
- **WHEN** the user confirms
- **THEN** the system SHALL call the `autoGroupPhotosIntoWaves` mutation with the user's UUID

#### Scenario: User cancels auto-group
- **WHEN** the user taps the "Auto-Group" button and the confirmation dialog appears
- **WHEN** the user cancels
- **THEN** no mutation SHALL be called and the screen SHALL remain unchanged

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

### Requirement: Loading state during auto-group
The system SHALL provide visual feedback while the auto-group loop is in progress.

#### Scenario: Loading indicator during auto-group loop
- **WHEN** the auto-group mutation loop is running
- **THEN** the system SHALL display a loading indicator
- **THEN** the auto-group button SHALL be disabled to prevent duplicate calls
- **THEN** newly created waves SHALL appear incrementally in the list as each mutation returns
