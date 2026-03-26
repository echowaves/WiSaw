## MODIFIED Requirements

### Requirement: Waves Search Bar Bottom Position
The system SHALL render the waves search bar at the bottom of the WavesHub screen, wrapped in `KeyboardStickyView`, with a negative `closed` offset calculated from `useSafeAreaInsets().bottom` plus a fixed gap, so the search bar clears the device safe area (home indicator) with a meaningful visual margin.

#### Scenario: Search bar floats above safe area
- **WHEN** the Waves screen is displayed and the search bar is visible
- **THEN** the search bar SHALL be rendered at the bottom of the screen via `KeyboardStickyView` with `closed` offset of `-(insets.bottom + 8)` where `insets.bottom` is from `useSafeAreaInsets()`
- **THEN** the search bar SHALL have visible clearance above the home indicator on notched devices

#### Scenario: Non-notched device
- **WHEN** the device has no home indicator (`insets.bottom === 0`)
- **THEN** the search bar SHALL be positioned 8px above its natural bottom position

#### Scenario: Keyboard opens
- **WHEN** the user taps the search input and the keyboard appears
- **THEN** the search bar SHALL follow the keyboard upward, maintaining 16px gap above the keyboard

#### Scenario: No search icon
- **WHEN** the search bar is rendered
- **THEN** no search icon SHALL be displayed inside the input (the bar auto-submits via debounce, no visual search affordance needed)
