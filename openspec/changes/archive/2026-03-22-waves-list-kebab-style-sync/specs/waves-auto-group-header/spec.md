## MODIFIED Requirements

### Requirement: Auto-Group Button in Waves Header
The system SHALL display a kebab (three-dot vertical) menu icon in the upper-right navigation bar of the Waves screen. The button SHALL use reactive theme colors from `getTheme(isDarkMode)` (not static `SHARED_STYLES.theme`) to properly support dark mode. The icon SHALL display an inline ungrouped-count badge when the count is greater than zero.

#### Scenario: Waves header kebab button uses reactive theme
- **WHEN** the user navigates to the Waves screen in dark mode
- **THEN** the kebab button SHALL use `theme.INTERACTIVE_BACKGROUND` for background, `theme.INTERACTIVE_BORDER` for border, and `theme.TEXT_PRIMARY` for icon color
- **THEN** these values SHALL be derived from `getTheme(isDarkMode)` to reflect the current theme mode
