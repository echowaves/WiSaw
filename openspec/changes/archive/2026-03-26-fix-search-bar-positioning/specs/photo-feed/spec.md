## MODIFIED Requirements

### Requirement: PhotosList search bar keyboard handling
The PhotosList search bar SHALL use `KeyboardStickyView` from `react-native-keyboard-controller` with a negative `closed` offset so the search bar is visible above the footer when the keyboard is closed. The `closed` offset SHALL be `-(FOOTER_HEIGHT + FOOTER_GAP)` (currently `-94`) to translate the search bar upward from its natural document-flow position, clearing the absolute-positioned footer. The `opened` offset SHALL remain `KEYBOARD_GAP` (`16`). In the results render branch (`photosList.length > 0`), both the `PhotosListSearchBar` and `PhotosListFooter` SHALL be rendered at the outer View level (outside `<View style={styles.container}>`), matching their placement in the default/empty-state branches.

#### Scenario: Search bar visible when keyboard is closed
- **WHEN** the search segment is active (`activeSegment === 2`) and the keyboard is closed
- **THEN** the search bar SHALL be visible on screen, positioned above the footer
- **THEN** the `KeyboardStickyView` `closed` offset SHALL be `-(FOOTER_HEIGHT + FOOTER_GAP)` to translate the bar upward from its natural position

#### Scenario: Search bar stays above keyboard
- **WHEN** a user taps the search bar in the photos list
- **THEN** the search bar SHALL remain positioned directly above the keyboard

#### Scenario: Search bar returns to position above footer
- **WHEN** the keyboard is dismissed
- **THEN** the search bar SHALL return to its position above the footer

#### Scenario: Search results render without gap
- **WHEN** search results are displayed (`photosList.length > 0` and `activeSegment === 2`)
- **THEN** the `PhotosListSearchBar` and `PhotosListFooter` SHALL be rendered as siblings at the outer `<View style={{ flex: 1 }}>` level, outside `<View style={styles.container}>`
- **THEN** the masonry grid SHALL start immediately below the header with no empty gap

#### Scenario: Empty search results show search bar
- **WHEN** a search returns zero results (`photosList.length === 0` and `activeSegment === 2`)
- **THEN** the search bar SHALL remain visible with the same positioning as the non-empty results state
