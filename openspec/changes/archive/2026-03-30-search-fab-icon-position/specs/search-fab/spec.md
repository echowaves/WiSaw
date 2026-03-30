## MODIFIED Requirements

### Requirement: FAB expands into inline search bar
The system SHALL animate the FAB into an inline search bar when tapped. When collapsed, the FAB SHALL display a magnifying glass icon anchored at the left edge. When expanding, the FAB button SHALL animate from the left edge to the right edge of the bar, and the icon SHALL change to a send icon. The search input field SHALL fade in on the left side. The clear button (✕) SHALL only appear when the input text is non-empty. The animation SHALL use Reanimated's `withSpring` for a natural feel.

#### Scenario: User taps FAB to expand
- **WHEN** the user taps the collapsed FAB
- **THEN** the FAB container width SHALL animate from `FAB_SIZE` (56px) to `EXPANDED_WIDTH` (screen width minus horizontal margins)
- **THEN** the FAB button SHALL animate from the left edge (`translateX: 0`) to the right edge (`translateX: expandedWidth - FAB_SIZE`) of the bar
- **THEN** the FAB icon SHALL change from magnifying glass (`search`) to send icon (`send`)
- **THEN** the bar padding SHALL transition from `paddingLeft: FAB_SIZE + 4` to `paddingRight: FAB_SIZE + 4` to accommodate the FAB on the right
- **THEN** a `TextInput` SHALL fade in on the left side of the bar
- **THEN** the TextInput SHALL receive focus and the keyboard SHALL open
- **THEN** the TextInput SHALL only auto-focus on the collapsed-to-expanded transition, not on subsequent re-renders while already expanded
- **THEN** the FAB SHALL slide up to sit just above the keyboard (8px gap) using `useReanimatedKeyboardAnimation` from `react-native-keyboard-controller`
- **THEN** the masonry layout SHALL NOT resize when the keyboard opens — photos may scroll under the keyboard

#### Scenario: Clear button visibility
- **WHEN** the search bar is expanded and the input text is empty
- **THEN** the clear button (✕) SHALL NOT be visible
- **WHEN** the search bar is expanded and the input text is non-empty
- **THEN** the clear button (✕) SHALL appear between the TextInput and the FAB button

#### Scenario: User taps FAB icon when expanded
- **WHEN** the user taps the FAB button (send icon) while the search bar is expanded
- **THEN** the keyboard SHALL be dismissed via `Keyboard.dismiss()`
- **THEN** `reload(activeSegment, searchTerm)` SHALL be called, passing the current search term explicitly to avoid stale closures
- **THEN** the search bar SHALL remain expanded

#### Scenario: User presses keyboard return key
- **WHEN** the user presses the return/search key on the keyboard while the search bar is focused
- **THEN** the keyboard SHALL be dismissed via `Keyboard.dismiss()`
- **THEN** `reload(activeSegment, searchTerm)` SHALL be called, passing the current search term explicitly
- **THEN** the search bar SHALL remain expanded showing the search term
- **THEN** the TextInput SHALL NOT regain focus on subsequent re-renders

#### Scenario: Expansion animation completes
- **WHEN** the expand animation finishes
- **THEN** the container SHALL have `borderRadius` of 28
- **THEN** the TextInput `opacity` SHALL be 1
- **THEN** the FAB button SHALL be at the right edge of the bar with a send icon

### Requirement: Search dismissal clears and collapses
The system SHALL dismiss search mode when the user taps the clear button (✕), collapsing the search bar back to the FAB and reloading the segment without a search filter.

#### Scenario: User taps clear button
- **WHEN** the user taps the ✕ button in the expanded search bar
- **THEN** `searchTerm` SHALL be set to empty string (making `isSearchActive` false)
- **THEN** `isSearchExpanded` SHALL be set to false
- **THEN** the FAB button SHALL animate from the right edge back to the left edge (`translateX: 0`)
- **THEN** the FAB icon SHALL change from send back to magnifying glass (`search`)
- **THEN** the search bar SHALL collapse back to the FAB with a reverse animation
- **THEN** `reload(activeSegment, '')` SHALL be called, passing the empty string explicitly to ensure the cleared term is used immediately rather than relying on async state update

#### Scenario: No-results state with active search
- **WHEN** a search returns zero results and `isSearchActive` is true
- **THEN** an `EmptyStateCard` SHALL be displayed with title "No results for '{term}'"
- **THEN** the card SHALL include a "Clear Search" action that dismisses search mode
- **THEN** the FAB SHALL remain expanded with the send icon on the right so the user can refine their query
