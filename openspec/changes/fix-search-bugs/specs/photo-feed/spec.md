## MODIFIED Requirements

### Requirement: PhotosList search bar keyboard handling
The PhotosList search bar SHALL use `KeyboardStickyView` from `react-native-keyboard-controller` instead of the custom `useKeyboardTracking` hook and manual positioning. The search bar SHALL be rendered outside the masonry content flex container to prevent `KeyboardStickyView` from reserving layout space that creates a gap at the top of the results list.

#### Scenario: Search bar stays above keyboard
- **WHEN** a user taps the search bar in the photos list
- **THEN** the search bar SHALL remain positioned directly above the keyboard

#### Scenario: Search bar returns to original position
- **WHEN** the keyboard is dismissed
- **THEN** the search bar SHALL return to its original bottom position

#### Scenario: Search results render without gap
- **WHEN** search results are displayed (`photosList.length > 0` and `activeSegment === 2`)
- **THEN** the `PhotosListSearchBar` SHALL be rendered as a sibling of `PhotosListFooter` outside the masonry content `View`
- **THEN** the masonry grid SHALL start immediately below the header with no empty gap
