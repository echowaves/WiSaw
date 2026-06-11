## MODIFIED Requirements

### Requirement: Send button disabled state

The send button SHALL be disabled when the text input is empty. The send button SHALL use `onTouchStart` (not `onPress`) to handle taps, ensuring the touch event is captured before the focused `TextInput` blurs and dismisses the keyboard, which would otherwise cancel the gesture due to layout shift.

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
- **THEN** the send handler SHALL execute immediately via `onTouchStart` before the blur event causes layout shift
- **THEN** the comment SHALL be submitted successfully
