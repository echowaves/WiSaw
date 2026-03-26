## ADDED Requirements

### Requirement: Waves Search Bar Clear Button
The system SHALL display a clear (`✕`) button inside the waves search input when the search text is non-empty.

#### Scenario: Search text is entered
- **WHEN** `searchText` has one or more characters
- **THEN** a circular clear button with a close icon SHALL appear on the right side of the search input

#### Scenario: Clear button is pressed
- **WHEN** the user presses the clear button
- **THEN** `searchText` SHALL be set to an empty string
- **THEN** the search input SHALL be refocused
- **THEN** the debounced search SHALL trigger, reloading the unfiltered waves list

#### Scenario: Search text is empty
- **WHEN** `searchText` is empty
- **THEN** the clear button SHALL NOT be rendered

### Requirement: Waves Search Bar Bottom Position
The system SHALL render the waves search bar at the bottom of the WavesHub screen, wrapped in `KeyboardStickyView`, instead of at the top.

#### Scenario: Search bar floats above bottom
- **WHEN** the Waves screen is displayed and the search bar is visible
- **THEN** the search bar SHALL be rendered at the bottom of the screen via `KeyboardStickyView` with `offset: { closed: 4, opened: 16 }`

#### Scenario: Keyboard opens
- **WHEN** the user taps the search input and the keyboard appears
- **THEN** the search bar SHALL follow the keyboard upward, maintaining 16px gap above the keyboard

#### Scenario: No search icon
- **WHEN** the search bar is rendered
- **THEN** no search icon SHALL be displayed inside the input (the bar auto-submits via debounce, no visual search affordance needed)

### Requirement: Waves Search-Aware Empty State
The system SHALL display a search-specific empty state when a search query returns zero results, distinct from the default "No Waves Yet" empty state.

#### Scenario: Search returns no results
- **WHEN** the waves list is empty AND `searchText` is non-empty
- **THEN** the `ListEmptyComponent` SHALL render an `EmptyStateCard` with icon `search`, title "No Results Found", subtitle "Try different keywords.", and action text "Clear Search"
- **THEN** pressing "Clear Search" SHALL clear `searchText`

#### Scenario: No waves exist and no search is active
- **WHEN** the waves list is empty AND `searchText` is empty
- **THEN** the `ListEmptyComponent` SHALL render the default "No Waves Yet" empty state with "Create a Wave" and optional "Auto Group" actions

## MODIFIED Requirements

### Requirement: Empty State Hides Search Bar
The system SHALL hide the search bar when the waves list is empty AND no search term is active.

#### Scenario: No waves exist and no search active
- **WHEN** the waves list has zero items AND `searchText` is empty
- **THEN** the search bar SHALL NOT be rendered

#### Scenario: Waves exist
- **WHEN** the waves list has one or more items
- **THEN** the search bar SHALL be rendered at the bottom of the screen

#### Scenario: Search returns zero results
- **WHEN** the waves list has zero items AND `searchText` is non-empty
- **THEN** the search bar SHALL remain visible so the user can modify or clear the search
