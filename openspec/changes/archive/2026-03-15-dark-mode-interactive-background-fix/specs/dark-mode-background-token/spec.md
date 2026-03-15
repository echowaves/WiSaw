## ADDED Requirements

### Requirement: Dark mode INTERACTIVE_BACKGROUND SHALL be opaque
The `DARK_THEME.INTERACTIVE_BACKGROUND` token in `src/theme/sharedStyles.js` SHALL use the opaque hex color `#563027` instead of `rgba(234, 94, 61, 0.15)`.

#### Scenario: Token value in dark mode
- **WHEN** the dark theme is active
- **THEN** `INTERACTIVE_BACKGROUND` SHALL resolve to `#563027`

#### Scenario: Consistent list gap color across screens
- **WHEN** any screen (WavesHub, WaveDetail, PhotosList) renders list items with gaps in dark mode
- **THEN** the gap background color SHALL be `#563027` regardless of the parent view hierarchy

#### Scenario: Light mode unaffected
- **WHEN** the light theme is active
- **THEN** `INTERACTIVE_BACKGROUND` SHALL remain `rgba(234, 94, 61, 0.05)` (unchanged)
