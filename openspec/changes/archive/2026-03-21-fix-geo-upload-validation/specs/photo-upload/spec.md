## ADDED Requirements

### Requirement: Geo Coordinate Validation at Upload Time
The system SHALL validate that queued photos have valid geo coordinates before submitting the `createPhoto` GraphQL mutation. This serves as a last line of defense against uploading photos without location data.

#### Scenario: Queued item has valid coordinates
- **WHEN** a queued photo has non-zero latitude and longitude in its location data
- **THEN** the upload SHALL proceed normally

#### Scenario: Queued item has null or missing location
- **WHEN** a queued photo has `null`, `undefined`, or missing location data
- **THEN** the upload SHALL be rejected
- **THEN** the item SHALL be removed from the upload queue
- **THEN** the user SHALL be shown an error message indicating the photo was skipped due to missing location

#### Scenario: Queued item has zero coordinates
- **WHEN** a queued photo has latitude and longitude both equal to 0
- **THEN** the upload SHALL be rejected
- **THEN** the item SHALL be removed from the upload queue
- **THEN** the user SHALL be shown an error message indicating the photo was skipped due to missing location

### Requirement: Wave Detail Photo Upload Location
The system SHALL obtain valid GPS coordinates in the Wave Detail screen before permitting photo capture, using the same location initialization as the main photo feed.

#### Scenario: WaveDetail camera with location available
- **WHEN** the user opens WaveDetail and location permission is granted
- **THEN** the system SHALL obtain device coordinates
- **THEN** photos captured from WaveDetail SHALL include valid coordinates

#### Scenario: WaveDetail camera without location
- **WHEN** the user opens WaveDetail and location is not yet available
- **THEN** the camera button SHALL be accessible but capture SHALL be blocked until location is ready
- **THEN** the user SHALL be shown a "Waiting for location..." message if they attempt capture
