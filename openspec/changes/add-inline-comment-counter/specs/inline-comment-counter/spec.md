# Inline Comment Counter Specification

## Purpose
Provides a character counter in the inline comment input row, showing users the remaining characters available up to the 140-character limit.

## ADDED Requirements

### Requirement: Character counter display in inline comment input
The inline comment input row SHALL display a character counter showing the number of remaining characters available before reaching the 140-character limit. The counter SHALL be visible whenever the inline input is active.

#### Scenario: Counter shows full character budget when input is empty
- **WHEN** the inline comment input is shown and no text has been entered
- **THEN** the counter SHALL display "140"

#### Scenario: Counter decrements as user types
- **WHEN** the user types text in the inline comment input
- **THEN** the counter SHALL display the remaining characters (140 minus the number of characters typed)
- **AND** the counter SHALL update on every keystroke

#### Scenario: Counter stops at zero
- **WHEN** the user has typed 140 characters
- **THEN** the counter SHALL display "0"
- **AND** no additional characters SHALL be accepted

#### Scenario: Counter is positioned between input and send button
- **WHEN** the inline comment input row is displayed
- **THEN** the counter SHALL appear between the text input field and the send button
- **AND** the close button SHALL remain on the far left

#### Scenario: Character limit is enforced via TextInput maxLength
- **WHEN** the TextInput in the inline comment input receives user input
- **THEN** it SHALL use `maxLength={140}` to prevent input beyond the limit

#### Scenario: Input text is truncated on change
- **WHEN** the `onChangeText` handler is invoked
- **THEN** the input value SHALL be sliced to a maximum of 140 characters before being stored in state

### Requirement: Consistent character limit with modal input
The inline comment input SHALL use the same 140-character limit as the modal input screen (`/modal-input`).

#### Scenario: Both inputs share the same limit value
- **WHEN** a user starts a comment in the inline input and another in the modal input
- **THEN** both SHALL allow exactly 140 characters of input
- **AND** both SHALL display the same counter format (remaining characters)
