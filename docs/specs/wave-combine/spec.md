## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for wave combining in WiSaw.

## Requirements

### Requirement: User can combine selected waves
The system SHALL allow users to combine 2 or more selected waves into one wave with a single action.

#### Scenario: User combines waves
- **WHEN** user has selected 2 or more waves and taps the "Combine" button
- **THEN** the system shows a confirmation alert with the target wave name and total photo count
- **AND** upon confirmation, the system merges all selected waves into the target wave

#### Scenario: Combine button disabled with fewer than 2 selections
- **WHEN** user has selected fewer than 2 waves
- **THEN** the "Combine" button is disabled and shows "Combine (1)"

### Requirement: System auto-selects target wave by photo count
The system SHALL automatically select the wave with the most photos as the target (surviving) wave when combining.

#### Scenario: Auto-pick wave with most photos
- **WHEN** user initiates combine on selected waves
- **THEN** the wave with the highest photosCount is chosen as the target wave

#### Scenario: Tie-breaking for equal photo counts
- **WHEN** multiple waves have the same photosCount
- **THEN** the most recently updated wave is chosen as target

### Requirement: Combine shows confirmation before executing
The system SHALL display a confirmation dialog before executing the merge operation.

#### Scenario: Confirmation dialog shows merge details
- **WHEN** user taps "Combine" with 3 waves selected
- **THEN** the dialog shows "Merge 3 waves into 'Wave Name'? X photos will be moved."

#### Scenario: User cancels combine
- **WHEN** user taps "Cancel" on the confirmation dialog
- **THEN** no merge occurs and selection state is preserved

### Requirement: Selected waves are removed from UI after merge
The system SHALL remove merged source waves from the waves list after a successful combine operation.

#### Scenario: Source waves removed after merge
- **WHEN** merge operation completes successfully
- **THEN** the source waves are removed from the list, the target wave remains with updated photo count, and selection mode is exited