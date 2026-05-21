## MODIFIED Requirements

### Requirement: Auto-group toggle

The system SHALL allow the user to enable or disable automatic location-triggered grouping via a persistent toggle setting. The toggle state SHALL be persisted to AsyncStorage and SHALL be hydrated into the `groupingAtom` Jotai atom during app startup, so all components read the correct value immediately without requiring the user to visit the GroupingSettings screen.

#### Scenario: Toggle disabled

- **WHEN** auto-group toggle is OFF
- **THEN** system does NOT trigger auto-group on location drift (manual "Auto Group" button still works)

#### Scenario: Toggle enabled

- **WHEN** auto-group toggle is ON (default)
- **THEN** system triggers auto-group when location drift threshold is exceeded

#### Scenario: Toggle state persists

- **WHEN** user closes and reopens the app
- **THEN** the auto-group toggle retains its previous state

#### Scenario: Toggle state hydrated into atom at startup

- **WHEN** the app starts and `hydrateGroupingAtom()` loads settings from AsyncStorage
- **THEN** the `groupingAtom` Jotai atom SHALL be set with the hydrated `{ enabled, groupingLevel, ... }` values
- **THEN** all components reading `groupingAtom` SHALL see the persisted `enabled` value immediately after initialization completes
- **THEN** the hydration SHALL NOT depend on the user visiting the GroupingSettings screen
