## MODIFIED Requirements

### Requirement: Send button disabled state

The send button SHALL be disabled when the text input is empty. When the text input is focused (keyboard visible) and the user taps the send button, the comment SHALL be submitted on the first tap without requiring a second tap.

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

#### Scenario: Blur dismisses keyboard and submits comment

- **WHEN** the user has typed a comment and the text input is focused
- **AND** the text input loses focus (e.g., by tapping the send button)
- **THEN** the keyboard SHALL dismiss
- **THEN** the comment SHALL be submitted if the text is non-empty
- **AND** the inline input SHALL collapse back to the "Add Comment" button

#### Scenario: Cancel button prevents submission

- **WHEN** the user taps the cancel button
- **THEN** the inline input SHALL collapse without submitting any comment
- **AND** the text input text SHALL be cleared
