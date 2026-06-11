## MODIFIED Requirements

### Requirement: Send button disabled state

The send button SHALL be disabled when the text input is empty. The send button SHALL use `onTouchStart` to set a flag indicating the send was tapped, and the `TextInput` SHALL use `onBlur` to check that flag and submit the comment — this avoids the race condition where `onPress` is cancelled by the blur-induced layout shift.

#### Scenario: Send button disabled when input is empty

- **WHEN** the text input is empty
- **THEN** the send button is disabled (opacity 0.4)
- **AND** the close button remains enabled

#### Scenario: Send button submits on first tap with keyboard visible

- **WHEN** the user types a comment and the keyboard is visible
- **AND** the user taps the send button
- **THEN** the comment SHALL be submitted on the first tap
- **AND** the keyboard SHALL dismiss
- **AND** the inline input SHALL collapse back to the "Add Comment" button
- **AND** no second tap SHALL be required

#### Scenario: Send button tap does not race with blur

- **WHEN** the user taps the send button and the TextInput loses focus
- **THEN** `onTouchStart` on the send button SHALL set a flag before blur occurs
- **THEN** `onBlur` on the TextInput SHALL detect the flag and submit the comment
- **THEN** the comment SHALL be submitted successfully

#### Scenario: Tapping outside input does not submit

- **WHEN** the user taps outside the inline input (not the send button) causing the TextInput to lose focus
- **THEN** the comment SHALL NOT be submitted
- **THEN** the inline input SHALL remain visible (per existing spec behavior)

#### Scenario: Cancel button does not submit

- **WHEN** the user taps the cancel button
- **THEN** the inline input SHALL collapse without submitting any comment
- **AND** the `onBlur` handler SHALL skip submission because cancel was tapped first
