## Purpose
Detect missing API configuration at startup and surface a visible error instead of silently failing.

## Requirements

### Requirement: Startup check for API configuration
The app SHALL check that `API_URI` and `API_KEY` are defined and non-empty at module load time in `src/consts.js`. If either value is `undefined`, `null`, or an empty string, the app SHALL log a prominent console error and show a user-visible `Alert` explaining that API configuration is missing.

#### Scenario: API configuration is present
- **WHEN** the app starts with valid `API_URI` and `API_KEY` values
- **THEN** no alert SHALL be shown
- **THEN** the app SHALL function normally

#### Scenario: API_URI is missing
- **WHEN** the app starts and `API_URI` is `undefined` or empty
- **THEN** a console error SHALL be logged with the text "API configuration missing"
- **THEN** an `Alert` SHALL be displayed to the user indicating that the app cannot connect to the server

#### Scenario: API_KEY is missing
- **WHEN** the app starts and `API_KEY` is `undefined` or empty
- **THEN** a console error SHALL be logged with the text "API configuration missing"
- **THEN** an `Alert` SHALL be displayed to the user indicating that the app cannot connect to the server
