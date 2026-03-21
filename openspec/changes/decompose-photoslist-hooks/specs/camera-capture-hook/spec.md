## ADDED Requirements

### Requirement: useCameraCapture hook encapsulates camera logic
The `useCameraCapture` hook SHALL manage the camera opening state and expose permission checking and photo/video capture functions.

#### Scenario: Hook returns camera state and handlers
- **WHEN** `useCameraCapture` is called with `{ location, enqueueCapture }`
- **THEN** it SHALL return `{ isCameraOpening, checkPermissionsForPhotoTaking }`

### Requirement: Double-click prevention
The hook SHALL prevent double-clicking camera buttons by tracking `isCameraOpening` state.

#### Scenario: Camera already opening
- **WHEN** `checkPermissionsForPhotoTaking` is called while `isCameraOpening` is true
- **THEN** the call SHALL return immediately without launching the camera

#### Scenario: Normal camera launch
- **WHEN** `checkPermissionsForPhotoTaking({ cameraType, waveUuid })` is called and `isCameraOpening` is false
- **THEN** `isCameraOpening` SHALL be set to true, permissions SHALL be requested, and the camera SHALL launch if granted

### Requirement: Permission flow with Settings fallback
The hook SHALL request camera and media library permissions sequentially, showing an alert with "Open Settings" if either is denied.

#### Scenario: Camera permission denied
- **WHEN** camera permission is not granted
- **THEN** an Alert SHALL be shown with an "Open Settings" button that opens device settings

#### Scenario: Media library permission denied after camera granted
- **WHEN** camera permission is granted but media library permission is not
- **THEN** an Alert SHALL be shown with an "Open Settings" button

### Requirement: Camera state always resets
The hook SHALL always reset `isCameraOpening` to false after the capture flow completes, regardless of success or failure.

#### Scenario: Successful capture
- **WHEN** the user takes a photo/video and the capture completes
- **THEN** the media SHALL be saved to the library, enqueued for upload, and `isCameraOpening` SHALL be set to false

#### Scenario: Capture cancelled or error
- **WHEN** the user cancels the camera or an error occurs
- **THEN** `isCameraOpening` SHALL be set to false
