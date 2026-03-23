## MODIFIED Requirements

### Requirement: Geo Coordinate Validation at Upload Time
The system SHALL validate that queued photos have valid geo coordinates before submitting the `createPhoto` GraphQL mutation. Coordinates SHALL originate from the global `locationAtom` at capture time.

#### Scenario: Queued item has valid coordinates
- **WHEN** a queued photo has non-zero latitude and longitude in its location data (sourced from `locationAtom.coords` at capture time)
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

### Requirement: Camera Capture Location Source
The `useCameraCapture` hook SHALL read location from the global `locationAtom` instead of receiving it as a parameter.

#### Scenario: Camera capture with ready location
- **WHEN** the user captures a photo and `locationAtom.status` is `ready`
- **THEN** the coordinates from `locationAtom.coords` SHALL be used for the upload queue item

#### Scenario: Camera capture with unavailable location
- **WHEN** the user manages to trigger capture and `locationAtom.status` is not `ready`
- **THEN** a "Waiting for location..." toast SHALL be shown
- **THEN** the capture SHALL be blocked
