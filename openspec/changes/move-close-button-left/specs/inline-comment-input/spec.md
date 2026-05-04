## MODIFIED Requirements

### Requirement: Inline comment input layout
The inline comment input row SHALL display the close button on the left side of the text input field, with the send button on the right side.

#### Scenario: Close button position
- **WHEN** the inline comment input is displayed
- **THEN** the close button (X) appears before the text input field
- **AND** the send button appears after the text input field

#### Scenario: User interaction
- **WHEN** user taps the close button
- **THEN** the comment input is closed and text is cleared

#### Scenario: Send button disabled state
- **WHEN** the text input is empty
- **THEN** the send button is disabled (opacity 0.4)
- **AND** the close button remains enabled
