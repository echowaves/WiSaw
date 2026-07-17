## MODIFIED Requirements

### Requirement: Minimum search term length for submission

The SearchFab send button SHALL be disabled when the search term contains fewer than 3 characters. The system SHALL prevent search submission through the FAB press when the minimum length is not met. Search is submitted exclusively by tapping the FAB send button — the keyboard return key SHALL NOT trigger a search submission.

#### Scenario: Send button disabled with short input
- **WHEN** the search bar is expanded and the search term has fewer than 3 characters
- **THEN** the send button SHALL appear visually disabled (reduced opacity) and SHALL NOT trigger a search when pressed

#### Scenario: Send button enabled with sufficient input
- **WHEN** the search bar is expanded and the search term has 3 or more characters
- **THEN** the send button SHALL appear fully opaque and SHALL trigger a search when pressed

#### Scenario: Keyboard return key does not submit search
- **WHEN** the user presses the keyboard return/done key regardless of search term length
- **THEN** the system SHALL NOT submit the search
- **THEN** the keyboard SHALL be dismissed
- **THEN** the search bar SHALL remain expanded with the current search term

#### Scenario: Search only triggers via FAB button
- **WHEN** the user has entered 3 or more characters in the search bar
- **THEN** only tapping the FAB send button SHALL trigger a search submission
- **THEN** pressing the keyboard return key SHALL NOT trigger a search submission
