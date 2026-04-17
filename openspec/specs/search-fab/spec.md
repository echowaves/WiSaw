## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for search fab in WiSaw.

## Requirements

### Requirement: Search FAB renders on photo feed
The system SHALL render a floating action button (FAB) with a magnifying glass icon in the bottom-left corner of the PhotosList screen, positioned above the footer. The FAB SHALL be visible on both the Global and Starred segments when search is not active.

#### Scenario: FAB visible on Global segment
- **WHEN** the user is viewing the Global segment (segment 0)
- **THEN** a magnifying glass FAB SHALL be visible in the bottom-left corner
- **THEN** the FAB SHALL be positioned `FOOTER_HEIGHT + 16` pixels from the bottom of the screen and 16 pixels from the left edge
- **THEN** the FAB SHALL have a `zIndex` of 10, floating above the masonry content

#### Scenario: FAB visible on Starred segment
- **WHEN** the user is viewing the Starred segment (segment 1)
- **THEN** the same FAB SHALL be visible with identical positioning

#### Scenario: FAB hidden when no content context
- **WHEN** the network is unavailable or terms and conditions are not accepted
- **THEN** the FAB SHALL NOT be rendered

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

### Requirement: FAB tracks keyboard position
The system SHALL slide the FAB vertically in sync with the keyboard open/close animation using `useReanimatedKeyboardAnimation` from `react-native-keyboard-controller`. When the keyboard is open, the FAB's bottom offset SHALL reduce from `FOOTER_HEIGHT + 16` to `8px` so it sits snugly above the keyboard without a large gap.

#### Scenario: Keyboard opens
- **WHEN** the keyboard opens (e.g., after tapping the FAB or an external search trigger)
- **THEN** the FAB SHALL translate upward in sync with the keyboard animation via `translateY: kbHeight.value`
- **THEN** the FAB's bottom offset SHALL animate from `FOOTER_HEIGHT + 16` to `8` so it sits close to the keyboard

#### Scenario: Keyboard closes
- **WHEN** the keyboard dismisses
- **THEN** the FAB SHALL slide back down in sync with the keyboard
- **THEN** the FAB's bottom offset SHALL return to `FOOTER_HEIGHT + 16`

### Requirement: Search applies to active segment
The system SHALL pass the `searchTerm` as an optional parameter to each segment's own feed endpoint (`feedByDate` for Global, `feedForWatcher` for Starred). The standalone `feedForTextSearch` endpoint SHALL NOT be used in the mobile app (it is reserved for the web app). Search results SHALL use the active segment's masonry layout configuration without any modifications — the layout (columns, tile size, comments overlay) SHALL remain identical to the non-search state of that segment. `isSearchActive` SHALL be derived from `searchTerm.length > 0`, not stored as separate state.

The `load()` function SHALL accept explicit override parameters `(segmentOverride, searchTermOverride, signal, pageOverride)` to prevent stale React state closures. Each parameter has a corresponding `effective*` variable that falls back to current state only if the override is null. `reload()` SHALL always pass page 0 explicitly. `handleLoadMore()` SHALL compute the new page inside `setPageNumber`'s updater and pass it explicitly to `load()`.

Both `feedByDate` and `feedForWatcher` GraphQL queries SHALL include `nextPage` in their response fields. The `load()` function SHALL read `{ photos, batch, noMoreData, nextPage }` from `getPhotos()`. When search is active and a page returns empty photos but `noMoreData` is false, `load()` SHALL auto-page by recursively calling itself with `nextPage` as the page override. When photos are returned and `nextPage` is provided, `pageNumber` SHALL be updated to `nextPage` so subsequent `handleLoadMore` starts from the correct offset. The auto-page recursion SHALL check `signal.aborted` before each recursive call to respect cancellation.

#### Scenario: Search on Global segment
- **WHEN** the user submits a search term while on the Global segment (segment 0)
- **THEN** `feedByDate` SHALL be called with the geo parameters AND `searchTerm: <term>`
- **THEN** the backend SHALL filter geo-proximate photos by the search term
- **THEN** results SHALL display in the Global segment's masonry layout (compact tiles, no comments overlay)
- **THEN** the layout SHALL NOT change from the non-search Global view

#### Scenario: Search on Starred segment
- **WHEN** the user submits a search term while on the Starred segment (segment 1)
- **THEN** `feedForWatcher` SHALL be called with the watcher parameters AND `searchTerm: <term>`
- **THEN** the backend SHALL filter watched photos by the search term
- **THEN** results SHALL display in the Starred segment's masonry layout (larger tiles with comments overlay)
- **THEN** the layout SHALL NOT change from the non-search Starred view

#### Scenario: Search term of any length
- **WHEN** the user types any number of characters in the search input
- **THEN** the search term SHALL be passed to the active segment's feed endpoint on submit
- **THEN** the backend SHALL handle filtering — there is no client-side minimum length restriction
- **THEN** feed loading SHALL NOT be blocked for short search terms

#### Scenario: Search auto-pages through empty results
- **WHEN** search is active and `load()` receives an empty photos array
- **THEN** if `noMoreData` is true, `stopLoading` SHALL be set to true
- **THEN** if `noMoreData` is false and `nextPage` is provided, `load()` SHALL recursively call itself with `nextPage` as the page override
- **THEN** `pageNumber` SHALL be updated to `nextPage` before the recursive call
- **THEN** the recursive call SHALL check `signal.aborted` before executing

#### Scenario: Search results update page cursor
- **WHEN** search is active and `load()` receives photos with a `nextPage` value
- **THEN** `pageNumber` SHALL be updated to `nextPage`
- **THEN** subsequent `handleLoadMore` calls SHALL use the updated `pageNumber` as the starting offset

#### Scenario: Pagination loads next page
- **WHEN** the user scrolls to the end of the current results
- **THEN** `handleLoadMore` SHALL compute `newPage` inside `setPageNumber`'s state updater
- **THEN** `load(null, null, null, newPage)` SHALL be called with the new page number passed explicitly
- **THEN** this SHALL prevent stale closure reads of `pageNumber`

#### Scenario: Auto-page respects abort signal
- **WHEN** the user switches segments or navigates away during an auto-page chain
- **THEN** the abort signal SHALL be checked before each recursive `load()` call

### Requirement: Search dismissal clears and collapses
The system SHALL dismiss search mode when the user taps the clear button (✕), collapsing the search bar back to the FAB and reloading the segment without a search filter.

#### Scenario: User taps clear button
- **WHEN** the user taps the ✕ button in the expanded search bar
- **THEN** `searchTerm` SHALL be set to empty string (making `isSearchActive` false)
- **THEN** `isSearchExpanded` SHALL be set to false
- **THEN** the FAB button SHALL animate from the right edge back to the left edge (`translateX: 0`)
- **THEN** the search bar SHALL collapse back to the FAB with a reverse animation
- **THEN** `reload(activeSegment, '')` SHALL be called, passing the empty string explicitly to ensure the cleared term is used immediately rather than relying on async state update

#### Scenario: No-results state with active search
- **WHEN** a search returns zero results and `isSearchActive` is true
- **THEN** an `EmptyStateCard` SHALL be displayed with title "No results for '{term}'"
- **THEN** the card SHALL include a "Clear Search" action that dismisses search mode
- **THEN** the FAB SHALL remain expanded so the user can refine their query

### Requirement: External search triggers expand FAB
The system SHALL expand the FAB and populate the search term when search is triggered externally via `photoSearchBus` (AI tag clicks) or `searchFromUrl` (deep links).

#### Scenario: AI tag click triggers search
- **WHEN** a `photoSearch` event is emitted via `photoSearchBus` with a term
- **THEN** `searchTerm` SHALL be set to the emitted term (making `isSearchActive` true)
- **THEN** the FAB SHALL expand to show the search bar with the term pre-filled
- **THEN** `reload()` SHALL be called with the current `activeSegment` and the search term

#### Scenario: URL deep link triggers search
- **WHEN** `searchFromUrl` prop is provided with a non-empty string
- **THEN** `searchTerm` SHALL be set to the URL parameter value (making `isSearchActive` true)
- **THEN** the FAB SHALL expand to show the search bar with the term pre-filled
- **THEN** `reload()` SHALL be called with the current `activeSegment` and the search term
