## MODIFIED Requirements

### Requirement: Theme Persistence
The system SHALL save the user's theme choice and restore it on app restart.

#### Scenario: User sets theme preference
- **WHEN** the user manually selects a theme
- **THEN** the preference is saved to filesystem storage via `expo-storage` and restored on next launch

#### Scenario: Theme preference loaded at startup
- **WHEN** the app initializes
- **THEN** the theme preference SHALL be read from `expo-storage` using `Storage.getItem({ key: 'USER_THEME_PREFERENCE' })`
- **THEN** the read SHALL NOT use a timeout wrapper
