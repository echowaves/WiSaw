## MODIFIED Requirements

### Requirement: FAB expands into inline search bar

The system SHALL animate the FAB into an inline search bar when tapped. When collapsed, the FAB SHALL display a magnifying glass icon anchored at the left edge of the bar (offset from screen edge by the Bookmarks FAB + gap). When expanding, the FAB button SHALL animate from the left edge to the right edge of the bar, and the icon SHALL change to a send icon. The search input field SHALL fade in on the left side. The bar SHALL grow rightward from its collapsed position. The clear button (✕) SHALL appear whenever the search bar is expanded, regardless of whether any text has been entered. The animation SHALL use Reanimated's `withSpring` for a natural feel.

#### Scenario: User taps FAB to expand
- **WHEN** the user taps the collapsed FAB
- **THEN** the FAB container width SHALL animate from `FAB_SIZE` (56px) to `EXPANDED_WIDTH` (screen width minus right margin minus bookmarks FAB offset)
- **THEN** the FAB button SHALL animate from the left edge of the bar (`translateX: 0`) to the right edge (`translateX: expandedWidth - FAB_SIZE`) of the bar
- **THEN** the FAB icon SHALL change from magnifying glass (`search`) to send icon (`send`)
- **THEN** the bar SHALL be anchored at `left: FAB_SIZE + 8` (64px from screen left) and grow rightward
- **THEN** the bar padding SHALL transition from `paddingLeft: FAB_SIZE + 4, paddingRight: 16` (collapsed, FAB on left) to `paddingLeft: 16, paddingRight: FAB_SIZE + 4` (expanded, FAB on right)
- **THEN** a `TextInput` SHALL fade in on the left side of the bar
- **THEN** the TextInput SHALL receive focus and the keyboard SHALL open
- **THEN** the TextInput SHALL only auto-focus on the collapsed-to-expanded transition, not on subsequent re-renders while already expanded
- **THEN** the FAB SHALL slide up to sit just above the keyboard (8px gap) using `useReanimatedKeyboardAnimation` from `react-native-keyboard-controller`
- **THEN** the masonry layout SHALL adjust its bottom padding to account for the keyboard height so photos do not flow under the keyboard

#### Scenario: Clear button visibility
- **WHEN** the search bar is expanded and the input text is empty
- **THEN** the clear button (✕) SHALL be visible between the TextInput and the FAB button
- **WHEN** the search bar is expanded and the input text is non-empty
- **THEN** the clear button (✕) SHALL be visible between the TextInput and the FAB button

#### Scenario: User taps FAB icon when expanded
- **WHEN** the user taps the FAB button (send icon) while the search bar is expanded
- **THEN** the keyboard SHALL be dismissed via `Keyboard.dismiss()`
- **THEN** `reload(activeSegment, searchTerm)` SHALL be called, passing the current search term explicitly to avoid stale closures
- **THEN** the search bar SHALL remain expanded

#### Scenario: User presses keyboard return key
- **WHEN** the user presses the return/done key on the keyboard while the search bar is focused
- **THEN** the keyboard SHALL be dismissed
- **THEN** the search SHALL NOT be submitted
- **THEN** the search bar SHALL remain expanded showing the search term
- **THEN** the TextInput SHALL NOT regain focus on subsequent re-renders

#### Scenario: Expansion animation completes
- **WHEN** the expand animation finishes
- **THEN** the container SHALL have `borderRadius` of 28
- **THEN** the TextInput `opacity` SHALL be 1
- **THEN** the FAB button SHALL be at the right edge of the bar with a send icon
