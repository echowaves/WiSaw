## ADDED Requirements

### Requirement: Minimum search term length for submission
The SearchFab send button SHALL be disabled when the search term contains fewer than 3 characters. The system SHALL prevent search submission through both the FAB press and keyboard return key when the minimum length is not met.

#### Scenario: Send button disabled with short input
- **WHEN** the search bar is expanded and the search term has fewer than 3 characters
- **THEN** the send button SHALL appear visually disabled (reduced opacity) and SHALL NOT trigger a search when pressed

#### Scenario: Send button enabled with sufficient input
- **WHEN** the search bar is expanded and the search term has 3 or more characters
- **THEN** the send button SHALL appear fully opaque and SHALL trigger a search when pressed

#### Scenario: Keyboard submit blocked with short input
- **WHEN** the user presses the keyboard return/search key and the search term has fewer than 3 characters
- **THEN** the system SHALL NOT submit the search

#### Scenario: Keyboard submit allowed with sufficient input
- **WHEN** the user presses the keyboard return/search key and the search term has 3 or more characters
- **THEN** the system SHALL dismiss the keyboard and submit the search
