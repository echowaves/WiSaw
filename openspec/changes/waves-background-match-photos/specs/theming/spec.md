## MODIFIED Requirements

### Requirement: Dynamic Component Theming
The system SHALL ensure all components dynamically adapt their colors based on the current theme mode. Content browsing screens (PhotosList, WavesHub) SHALL use `theme.INTERACTIVE_BACKGROUND` as their container background to provide consistent warm-tinted contrast with content thumbnails.

#### Scenario: Theme changes while app is running
- **WHEN** the user switches themes
- **THEN** all visible components immediately update their colors and styling to match the new theme

#### Scenario: WavesHub and PhotosList backgrounds match
- **WHEN** the user navigates between the Waves Hub and Photos List screens
- **THEN** both screens SHALL have identical background colors using `theme.INTERACTIVE_BACKGROUND`
- **THEN** this SHALL apply in both dark mode and light mode
