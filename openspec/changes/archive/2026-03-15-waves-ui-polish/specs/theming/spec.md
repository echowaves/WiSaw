## MODIFIED Requirements

### Requirement: Dynamic Component Theming
The system SHALL ensure all components dynamically adapt their colors based on the current theme mode. Screen-level containers SHALL use `theme.BACKGROUND` as their background color. `theme.INTERACTIVE_BACKGROUND` SHALL only be used for interactive elements (buttons, inputs, toggleable surfaces), not for screen or page backgrounds.

#### Scenario: Theme changes while app is running
- **WHEN** the user switches themes
- **THEN** all visible components immediately update their colors and styling to match the new theme

#### Scenario: Waves Hub screen background in dark mode
- **WHEN** the user navigates to the Waves Hub screen with dark mode active
- **THEN** the screen background SHALL be `theme.BACKGROUND` (dark: `#121212`, light: `#ffffff`)
- **THEN** the background SHALL match the standard background used by other screens in the app
