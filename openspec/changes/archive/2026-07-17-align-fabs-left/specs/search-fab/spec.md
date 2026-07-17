## MODIFIED Requirements

### Requirement: Search FAB renders on photo feed
The system SHALL render a floating action button (FAB) with a magnifying glass icon in the bottom-left corner of the PhotosList screen, positioned above the footer. The FAB SHALL be visible on both the Global and Starred segments when search is not active. The FAB SHALL sit to the right of the Bookmarks FAB on the same horizontal row, with an 8px gap between them.

#### Scenario: FAB visible on Global segment
- **WHEN** the user is viewing the Global segment (segment 0)
- **THEN** a magnifying glass FAB SHALL be visible on the left side of the screen
- **THEN** the FAB SHALL be positioned `FOOTER_HEIGHT + 16` pixels from the bottom of the screen
- **THEN** the Bookmarks FAB SHALL be at `left: 16` and the Search FAB bar SHALL start at `left: FAB_SIZE + 8` (64px from left edge)
- **THEN** the two FABs SHALL share the same vertical baseline (`bottom: FOOTER_HEIGHT + 16`)
- **THEN** the FAB SHALL have a `zIndex` of 10, floating above the masonry content

#### Scenario: FAB visible on Starred segment
- **WHEN** the user is viewing the Starred segment (segment 1)
- **THEN** the same FAB SHALL be visible with identical positioning

#### Scenario: FAB hidden when no content context
- **WHEN** the network is unavailable or terms and conditions are not accepted
- **THEN** the FAB SHALL NOT be rendered

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
- **THEN** the masonry layout SHALL NOT resize when the keyboard opens — photos may scroll under the keyboard

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

### Requirement: FAB tracks keyboard position
The system SHALL slide the FAB vertically in sync with the keyboard open/close animation using `useReanimatedKeyboardAnimation` from `react-native-keyboard-controller`. When the keyboard is open, the FAB's bottom offset SHALL reduce from `FOOTER_HEIGHT + 16` to `8px` so it sits snugly above the keyboard without a large gap. The Bookmarks FAB SHALL also lift with the keyboard, keeping both FABs aligned on the same horizontal row.

#### Scenario: Keyboard opens
- **WHEN** the keyboard opens (e.g., after tapping the FAB or an external search trigger)
- **THEN** the FAB SHALL translate upward in sync with the keyboard animation via `translateY: kbHeight.value`
- **THEN** the FAB's bottom offset SHALL animate from `FOOTER_HEIGHT + 16` to `8` so it sits close to the keyboard
- **THEN** the Bookmarks FAB SHALL also lift with the keyboard, maintaining the same vertical baseline as the Search FAB

#### Scenario: Keyboard closes
- **WHEN** the keyboard dismisses
- **THEN** the FAB SHALL slide back down in sync with the keyboard
- **THEN** the FAB's bottom offset SHALL return to `FOOTER_HEIGHT + 16`

### Requirement: Search term preserved on feed mode toggle
The system SHALL preserve the active search term when toggling between geo feed and bookmarks feed via the Bookmarks FAB. When the user switches modes, the feed SHALL reload with the current search term applied to the new data source, so search results update without requiring the user to re-enter the query.

#### Scenario: Toggle modes with active search
- **WHEN** the user has an active search term (e.g., 'beach')
- **AND** the user taps the Bookmarks FAB to switch from geo feed to bookmarks feed
- **THEN** the bookmarks feed SHALL reload with the search term 'beach' applied
- **THEN** the search term SHALL remain visible in the search input if the search bar is expanded
- **WHEN** the user taps the Bookmarks FAB again to switch back to geo feed
- **THEN** the geo feed SHALL reload with the search term 'beach' applied

#### Scenario: Toggle modes with no active search
- **WHEN** the user has no active search term
- **AND** the user taps the Bookmarks FAB to switch modes
- **THEN** the feed SHALL reload without any search filter
- **THEN** the search state SHALL remain unchanged
