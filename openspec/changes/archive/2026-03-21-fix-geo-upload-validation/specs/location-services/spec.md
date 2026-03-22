## ADDED Requirements

### Requirement: Location Validation Before Photo Capture
The system SHALL validate that a valid GPS location is available before permitting any photo capture or upload. A valid location has non-zero latitude and longitude coordinates.

#### Scenario: Location not yet available
- **WHEN** the user attempts to capture a photo and the device location has not been obtained
- **THEN** the camera action SHALL be blocked
- **THEN** the user SHALL be shown a "Waiting for location..." message

#### Scenario: Location is invalid (0,0)
- **WHEN** the location state contains coordinates of exactly (0, 0)
- **THEN** the system SHALL treat this as an uninitialized/invalid location
- **THEN** photo capture SHALL be blocked until valid coordinates are obtained

#### Scenario: Location is valid
- **WHEN** the location state contains non-zero latitude and longitude coordinates
- **THEN** photo capture SHALL be permitted
- **THEN** the valid coordinates SHALL be attached to the queued upload item
