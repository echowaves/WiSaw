# Theming Specification

## Purpose
The theming system provides full dark and light mode support with automatic system theme detection, manual toggle, theme persistence, and dynamic component-level color adaptation across the entire application interface.

## Requirements

### Requirement: Dark Mode Support
The system SHALL provide a complete dark theme implementation with dedicated color scheme and proper contrast ratios for all UI components.

#### Scenario: Dark mode is enabled
- **WHEN** dark mode is active
- **THEN** all screens, components, and navigation elements render with dark theme colors

### Requirement: Light Mode Support
The system SHALL provide a default light theme with optimized colors and contrast for all UI components.

#### Scenario: Light mode is active
- **WHEN** light mode is active (default)
- **THEN** all screens, components, and navigation elements render with light theme colors

### Requirement: System Theme Detection
The system SHALL automatically detect and apply the device's system-level theme preference on app launch.

#### Scenario: Device is set to dark mode
- **WHEN** the app launches on a device with system dark mode enabled
- **THEN** the app automatically uses dark mode unless overridden by user preference

#### Scenario: Device is set to light mode
- **WHEN** the app launches on a device with system light mode
- **THEN** the app uses light mode unless overridden by user preference

### Requirement: Theme Persistence
The system SHALL save the user's theme choice and restore it on app restart.

#### Scenario: User sets theme preference
- **WHEN** the user manually selects a theme
- **THEN** the preference is saved to filesystem storage via `expo-storage` and restored on next launch

#### Scenario: Theme preference loaded at startup
- **WHEN** the app initializes
- **THEN** the theme preference SHALL be read from `expo-storage` using `Storage.getItem({ key: 'USER_THEME_PREFERENCE' })`
- **THEN** the read SHALL NOT use a timeout wrapper

### Requirement: Theme Toggle in Drawer
The system SHALL provide a quick dark/light mode toggle in the bottom section of the drawer navigation menu.

#### Scenario: User toggles theme from drawer
- **WHEN** the user taps the theme toggle in the drawer menu
- **THEN** the app immediately switches between dark and light mode

### Requirement: Dynamic Component Theming
The system SHALL ensure all components dynamically adapt their colors based on the current theme mode. Content browsing screens (PhotosList, WavesHub, WaveDetail) SHALL use `theme.INTERACTIVE_BACKGROUND` as their container background to provide consistent warm-tinted contrast with content thumbnails.

#### Scenario: Theme changes while app is running
- **WHEN** the user switches themes
- **THEN** all visible components immediately update their colors and styling to match the new theme

#### Scenario: WavesHub and PhotosList backgrounds match
- **WHEN** the user navigates between the Waves Hub and Photos List screens
- **THEN** both screens SHALL have identical background colors using `theme.INTERACTIVE_BACKGROUND`
- **THEN** this SHALL apply in both dark mode and light mode

### Requirement: Dark mode INTERACTIVE_BACKGROUND SHALL be opaque
The `DARK_THEME.INTERACTIVE_BACKGROUND` token in `src/theme/sharedStyles.js` SHALL use the opaque hex color `#563027` instead of a semi-transparent rgba value.

#### Scenario: Token value in dark mode
- **WHEN** the dark theme is active
- **THEN** `INTERACTIVE_BACKGROUND` SHALL resolve to `#563027`

#### Scenario: Consistent list gap color across screens
- **WHEN** any screen (WavesHub, WaveDetail, PhotosList) renders list items with gaps in dark mode
- **THEN** the gap background color SHALL be `#563027` regardless of the parent view hierarchy

#### Scenario: Light mode unaffected
- **WHEN** the light theme is active
- **THEN** `INTERACTIVE_BACKGROUND` SHALL remain `rgba(234, 94, 61, 0.05)` (unchanged)
