# Comments Specification (Delta)

## MODIFIED Requirements

### Requirement: Comment submission dismisses keyboard
After a user submits a comment via either the inline comment input or modal input, the system SHALL immediately dismiss the keyboard.

#### Scenario: User submits inline comment via send button
- **WHEN** the user taps the send button in the inline comment input row
- **THEN** the keyboard SHALL dismiss immediately after the comment submission completes
- **THEN** the inline input SHALL collapse back to the "Add Comment" button

#### Scenario: User submits inline comment via keyboard return key
- **WHEN** the user presses the return/send key on the keyboard while typing a comment
- **THEN** the keyboard SHALL dismiss immediately after the comment submission completes
- **THEN** the inline input SHALL collapse back to the "Add Comment" button

#### Scenario: User submits modal comment via header send button
- **WHEN** the user taps the send button in the modal input header
- **THEN** the keyboard SHALL dismiss immediately after the comment submission completes
- **THEN** the modal SHALL navigate back to the previous screen

#### Scenario: User submits modal comment via submit button
- **WHEN** the user taps the submit button at the bottom of the modal input
- **THEN** the keyboard SHALL dismiss immediately after the comment submission completes
- **THEN** the modal SHALL navigate back to the previous screen

#### Scenario: Empty comment submission does not dismiss keyboard
- **WHEN** the user taps send without entering text
- **THEN** the comment is not submitted
- **THEN** the input remains active with keyboard visible
