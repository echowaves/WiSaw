## MODIFIED Requirements

### Requirement: PhotosList search bar keyboard handling
The PhotosList search bar SHALL use `KeyboardStickyView` from `react-native-keyboard-controller` instead of the custom `useKeyboardTracking` hook and manual positioning.

#### Scenario: Search bar stays above keyboard
- **WHEN** a user taps the search bar in the photos list
- **THEN** the search bar SHALL remain positioned directly above the keyboard

#### Scenario: Search bar returns to original position
- **WHEN** the keyboard is dismissed
- **THEN** the search bar SHALL return to its original bottom position
