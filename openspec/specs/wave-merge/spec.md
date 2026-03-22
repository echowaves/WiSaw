### Requirement: User can merge one wave into another
The system SHALL allow the user to merge a source wave into a target wave. All photos from the source wave SHALL be moved to the target wave, and the source wave SHALL be deleted.

#### Scenario: Successful merge from WavesHub context menu
- **WHEN** the user long-presses a wave card (or taps its ⋮ icon) and selects "Merge Into Another Wave..."
- **THEN** the system SHALL open a MergeWaveModal listing all waves except the source wave

#### Scenario: Successful merge from WaveDetail header menu
- **WHEN** the user taps the header ellipsis menu in WaveDetail and selects "Merge Into Another Wave..."
- **THEN** the system SHALL open a MergeWaveModal listing all waves except the current wave

#### Scenario: User selects a target wave
- **WHEN** the user taps a wave in the MergeWaveModal
- **THEN** the system SHALL show a confirmation alert with the source wave name, target wave name, and source photo count

#### Scenario: User confirms the merge
- **WHEN** the user taps "Merge" in the confirmation alert
- **THEN** the system SHALL call the `mergeWaves` mutation with `targetWaveUuid`, `sourceWaveUuid`, and `uuid`
- **THEN** the system SHALL show a success toast ("Waves merged successfully")

#### Scenario: Merge fails with API error
- **WHEN** the `mergeWaves` mutation returns an error
- **THEN** the system SHALL show an error toast with the error message
- **THEN** the system SHALL NOT remove the source wave from the list or navigate away

#### Scenario: User cancels at confirmation
- **WHEN** the user taps "Cancel" in the confirmation alert
- **THEN** the system SHALL close the alert and return to the MergeWaveModal without making any changes

### Requirement: MergeWaveModal provides search and filtering
The MergeWaveModal SHALL display a searchable list of target wave candidates, excluding the source wave.

#### Scenario: Modal displays waves excluding source
- **WHEN** the MergeWaveModal opens for source wave X
- **THEN** the list SHALL include all user waves except wave X
- **THEN** each wave item SHALL display the wave name and photo count

#### Scenario: User searches for a target wave
- **WHEN** the user types into the search field
- **THEN** the list SHALL filter to show only waves whose name contains the search text (case-insensitive)

#### Scenario: No matching waves
- **WHEN** the search returns zero results
- **THEN** the modal SHALL display a "No waves found" empty state

### Requirement: Merge is owner-only
Only the wave owner SHALL see the "Merge Into Another Wave..." option. Non-owners SHALL NOT see the merge option in any context menu.

#### Scenario: Non-owner long-presses a wave
- **WHEN** a user who is not the wave creator long-presses a wave card
- **THEN** the context menu SHALL NOT include "Merge Into Another Wave..."
