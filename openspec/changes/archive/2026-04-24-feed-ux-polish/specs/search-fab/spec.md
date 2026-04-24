## MODIFIED Requirements

### Requirement: FAB expands into inline search bar
The clear button (✕) SHALL be visible whenever the search bar is expanded, regardless of whether any text has been entered.

#### Scenario: Clear button visibility
- **WHEN** the search bar is expanded and the input text is empty
- **THEN** the clear button (✕) SHALL be visible between the TextInput and the FAB button
- **WHEN** the search bar is expanded and the input text is non-empty
- **THEN** the clear button (✕) SHALL be visible between the TextInput and the FAB button

### Requirement: Search dismissal clears and collapses
The system SHALL dismiss search mode when the user taps the clear button (✕), collapsing the search bar back to the FAB and reloading the segment without a search filter. This SHALL work whether or not text has been entered.

#### Scenario: User taps clear button with empty text
- **WHEN** the user taps the ✕ button in the expanded search bar with no text entered
- **THEN** `isSearchExpanded` SHALL be set to false
- **THEN** the FAB button SHALL animate from the right edge back to the left edge (`translateX: 0`)
- **THEN** the search bar SHALL collapse back to the FAB with a reverse animation
- **THEN** `reload(activeSegment, '')` SHALL be called
