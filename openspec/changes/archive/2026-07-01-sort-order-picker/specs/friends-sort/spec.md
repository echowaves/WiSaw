## MODIFIED Requirements

### Requirement: Friends list sort options
The friends screen SHALL provide sort options accessible via a `SortOrderPicker` bottom-sheet component with a segmented pill toggle. Available sort options SHALL be: Alphabetical A-Z, Alphabetical Z-A, and Recently Added.

#### Scenario: User selects a sort option
- **WHEN** the user taps the sort button (⋮) and selects a segment in the SortOrderPicker
- **THEN** the friends list SHALL reorder according to the selected sort
- **THEN** the selected segment SHALL be visually highlighted (white background on gray track)

#### Scenario: Default sort order
- **WHEN** the user has not selected a sort option in the current session
- **THEN** the friends list SHALL default to Recently Added sort (newest first)

#### Scenario: Sort state resets on app restart
- **WHEN** the app restarts
- **THEN** the sort selection SHALL reset to the default (Recently Added)

#### Scenario: Sort picker UI appearance
- **WHEN** the user opens the sort picker
- **THEN** a bottom sheet SHALL slide up from the bottom of the screen
- **THEN** the header "Sort By" SHALL appear on the left and a "Done" button on the right
- **THEN** a segmented pill control SHALL display the three options: A-Z, Z-A, Recent
- **THEN** the active option SHALL have a white background with dark text
- **THEN** inactive options SHALL have a gray background with dimmed text