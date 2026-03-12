## ADDED Requirements

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
The system SHALL call the `autoGroupPhotosIntoWaves(uuid: String!): AutoGroupResult!` GraphQL mutation to group ungrouped photos into waves.

#### Scenario: Successful auto-group with results
- **WHEN** the mutation completes successfully with `wavesCreated > 0`
- **THEN** the system SHALL display a success toast showing the number of waves created and photos grouped
- **THEN** the system SHALL refresh the waves list to show newly created waves

#### Scenario: Successful auto-group with no ungrouped photos
- **WHEN** the mutation completes successfully with `wavesCreated: 0` and `photosGrouped: 0`
- **THEN** the system SHALL display an informational toast indicating no ungrouped photos were found

#### Scenario: Auto-group mutation failure
- **WHEN** the mutation fails with an error
- **THEN** the system SHALL display an error toast with the error message
- **THEN** the waves list SHALL remain unchanged

### Requirement: Loading state during auto-group
The system SHALL provide visual feedback while the auto-group operation is in progress.

#### Scenario: Loading indicator during auto-group
- **WHEN** the auto-group mutation is in flight
- **THEN** the system SHALL display a loading indicator
- **THEN** the auto-group button SHALL be disabled to prevent duplicate calls
