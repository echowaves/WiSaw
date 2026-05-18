## Purpose

Enable automatic server-side photo grouping when the user moves to a new location, reducing manual intervention required to organize ungrouped photos into waves.

## Requirements

### Requirement: Auto-group trigger on location drift

The system SHALL automatically trigger server-side photo grouping when the app resumes to foreground and the user's current GPS location has drifted beyond the configured granularity threshold since the last auto-group operation.

#### Scenario: App resumes with significant location drift

- **WHEN** app comes to foreground AND current GPS coordinates differ from last trigger location by more than the configured threshold (e.g., 50km for CITY granularity)
- **THEN** system automatically calls `autoGroupPhotosIntoWaves` mutation with the user's granularity setting

#### Scenario: App resumes with no location drift

- **WHEN** app comes to foreground AND current GPS coordinates are within the configured threshold of last trigger location
- **THEN** system does NOT trigger auto-group and silently exits

#### Scenario: App resumes with no GPS fix yet

- **WHEN** app comes to foreground AND location status is not "ready"
- **THEN** system skips auto-group and waits until next foreground event

#### Scenario: No ungrouped photos

- **WHEN** auto-group triggers AND there are zero ungrouped photos
- **THEN** system shows toast "No ungrouped photos found" and returns gracefully

### Requirement: Granularity settings

The system SHALL provide a user-configurable granularity setting that controls the clustering radius for auto-grouping, with four preset options.

#### Scenario: User selects Near granularity

- **WHEN** user selects "Near" in settings
- **THEN** system stores DISTRICT granularity (10km threshold) and uses it for all future auto-group triggers

#### Scenario: User selects Medium granularity (default)

- **WHEN** user selects "Medium" in settings (or no selection made)
- **THEN** system stores CITY granularity (50km threshold) as the default

#### Scenario: User selects Far granularity

- **WHEN** user selects "Far" in settings
- **THEN** system stores REGION granularity (250km threshold)

#### Scenario: User selects World granularity

- **WHEN** user selects "World" in settings
- **THEN** system stores COUNTRY granularity (1000km threshold)

### Requirement: Auto-group toggle

The system SHALL allow the user to enable or disable automatic location-triggered grouping via a persistent toggle setting.

#### Scenario: Toggle disabled

- **WHEN** auto-group toggle is OFF
- **THEN** system does NOT trigger auto-group on location drift (manual "Auto Group" button still works)

#### Scenario: Toggle enabled

- **WHEN** auto-group toggle is ON (default)
- **THEN** system triggers auto-group when location drift threshold is exceeded

#### Scenario: Toggle state persists

- **WHEN** user closes and reopens the app
- **THEN** the auto-group toggle retains its previous state

### Requirement: Progress overlay

The system SHALL display a progress indicator during auto-group operations showing photos grouped count and waves created count.

#### Scenario: Auto-group in progress

- **WHEN** auto-group is running
- **THEN** system shows an overlay with "Auto-Grouping" title, photos grouped count, and waves created count

#### Scenario: Auto-group completes successfully

- **WHEN** auto-group finishes with results
- **THEN** system shows a toast: "Created N wave(s) with M photo(s)" and refreshes the waves list

#### Scenario: Auto-group fails

- **WHEN** auto-group throws an error
- **THEN** system shows an error toast with the error message

### Requirement: Last trigger location persistence

The system SHALL store the GPS coordinates used as the last auto-group trigger point, so future drift calculations compare against the correct reference location.

#### Scenario: Store trigger location after successful group

- **WHEN** auto-group completes successfully (at least one wave created)
- **THEN** system saves the current GPS coordinates as the new last trigger location

#### Scenario: Clear trigger location on no results

- **WHEN** auto-group completes with zero waves created
- **THEN** system does NOT update the last trigger location
