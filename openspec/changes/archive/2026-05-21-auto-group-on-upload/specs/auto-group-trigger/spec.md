## MODIFIED Requirements

### Requirement: Auto-group trigger on location drift
The system SHALL automatically trigger server-side photo grouping when the app resumes to foreground and the user's current GPS location has drifted beyond the configured granularity threshold since the last auto-group operation. The trigger SHALL only fire when `grouping.enabled` is `true`. This drift-based trigger serves as a fallback mechanism for photos that were uploaded while offline or before auto-grouping was enabled.

#### Scenario: App resumes with significant location drift and grouping enabled
- **WHEN** app comes to foreground AND `grouping.enabled` is `true` AND current GPS coordinates differ from last trigger location by more than the configured threshold
- **THEN** system automatically calls `autoGroupPhotosIntoWaves` mutation with the user's grouping level setting

#### Scenario: App resumes with significant location drift and grouping disabled
- **WHEN** app comes to foreground AND `grouping.enabled` is `false` AND current GPS coordinates differ from last trigger location by more than the configured threshold
- **THEN** system SHALL NOT trigger auto-group

#### Scenario: App resumes with no location drift
- **WHEN** app comes to foreground AND current GPS coordinates are within the configured threshold of last trigger location
- **THEN** system does NOT trigger auto-group and silently exits

#### Scenario: App resumes with no GPS fix yet
- **WHEN** app comes to foreground AND location status is not "ready"
- **THEN** system skips auto-group and waits until next foreground event

#### Scenario: No ungrouped photos
- **WHEN** auto-group triggers AND there are zero ungrouped photos
- **THEN** system does NOT call the mutation and silently exits

### Requirement: Auto-group toggle
The system SHALL allow the user to enable or disable automatic location-triggered grouping via a persistent toggle setting. When disabled, both the drift-based trigger AND the upload-time drift check SHALL be skipped. The manual "Auto Group" button on the Waves screen SHALL remain functional regardless of the toggle state.

#### Scenario: Toggle disabled
- **WHEN** auto-group toggle is OFF
- **THEN** system does NOT trigger auto-group on location drift
- **THEN** system does NOT perform pre-upload drift checks
- **THEN** manual "Auto Group" button still works

#### Scenario: Toggle enabled
- **WHEN** auto-group toggle is ON (default)
- **THEN** system triggers auto-group when location drift threshold is exceeded
- **THEN** system performs pre-upload drift checks via `isLocationInWave`

#### Scenario: Toggle state persists
- **WHEN** user closes and reopens the app
- **THEN** the auto-group toggle retains its previous state
