## ADDED Requirements

### Requirement: SortOrderPicker component
The system SHALL provide a reusable `SortOrderPicker` component that presents mutually exclusive sort options in a bottom-sheet modal. The component SHALL support two layout modes: segmented pill toggle (for 2-4 options) and 2×2 grid (for exactly 4 options).

#### Scenario: Component renders in segmented mode
- **WHEN** `SortOrderPicker` is rendered with `mode="segmented"` and `visible=true`
- **THEN** a bottom sheet SHALL slide up from the bottom of the screen
- **THEN** a header row SHALL display the title on the left and a "Done" button on the right
- **THEN** a segmented pill control SHALL display all options as equal-width segments
- **THEN** the active option SHALL have a white/light background with primary text color
- **THEN** inactive options SHALL have a gray background with secondary text color

#### Scenario: Component renders in grid mode
- **WHEN** `SortOrderPicker` is rendered with `mode="grid"` and `visible=true`
- **THEN** a bottom sheet SHALL slide up from the bottom of the screen
- **THEN** a header row SHALL display the title on the left and a "Done" button on the right
- **THEN** options SHALL be displayed in a 2×2 grid layout
- **THEN** the active option SHALL have a highlighted border or background
- **THEN** inactive options SHALL have a neutral background

#### Scenario: User selects an option
- **WHEN** the user taps a segment or grid cell
- **THEN** the `onSortChange` callback SHALL be invoked with `{ sortBy, sortDirection }`
- **THEN** the selected option SHALL immediately show as active
- **THEN** the menu SHALL remain open (auto-close on select is NOT expected)

#### Scenario: User closes the picker
- **WHEN** the user taps the "Done" button or the overlay outside the sheet
- **THEN** the `onClose` callback SHALL be invoked
- **THEN** the bottom sheet SHALL dismiss

#### Scenario: Dark mode support
- **WHEN** `isDarkMode=true` is passed to the component
- **THEN** the sheet background SHALL use a dark surface color
- **THEN** the active segment SHALL use a slightly lighter dark color
- **THEN** inactive segments SHALL use a darker gray background
- **THEN** text colors SHALL adapt for readability

### Requirement: Sort options data format
Each sort option SHALL be defined as an object with the following properties: `key` (unique string identifier), `label` (display text), `sortBy` (sort field key), and `sortDirection` ('asc' or 'desc').

#### Scenario: Active state detection
- **WHEN** an option has `sortBy` and `sortDirection` matching the current `sortBy` and `sortDirection` props
- **THEN** that option SHALL be rendered as the active/selected segment

#### Scenario: Default sort direction fallback
- **WHEN** an option does not provide `sortDirection` but the prop `sortDirection` is provided
- **THEN** the prop value SHALL be used as the option's default direction