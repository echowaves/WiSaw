## MODIFIED Requirements

### Requirement: GPS Permission Handling
The system SHALL request and manage location permissions at app startup via the global `useLocationProvider` hook, storing the result in the `locationAtom`. Permission is requested once from the root layout, not per-screen. When permission is denied, the system SHALL display an informative, non-pressuring alert explaining why location is needed, with an optional "Open Settings" convenience button.

Camera and photo library permission denial alerts SHALL include both a "Cancel" button (with `style: 'cancel'`) and an "Open Settings" button. The "Cancel" button SHALL dismiss the alert without taking any action. This applies to all permission denial alerts in both `useCameraCapture` and `WaveDetail` screens.

#### Scenario: First-time location request
- **WHEN** the app starts and `useLocationProvider` runs
- **THEN** the system SHALL call `Location.requestForegroundPermissionsAsync()`
- **THEN** if granted, the atom transitions from `pending` to `ready` (via fast-seed or watcher)
- **THEN** if denied, the atom transitions from `pending` to `denied`

#### Scenario: Permission previously denied
- **WHEN** the user previously denied location permission
- **THEN** the atom SHALL be set to `{ status: 'denied', coords: null }`
- **THEN** an Alert SHALL explain that WiSaw uses location to show nearby photos and that the feature is unavailable without it
- **THEN** the Alert SHALL include an "Open Settings" button as a convenience option and an "OK" dismiss button
- **THEN** the Alert SHALL NOT use pressuring, guilt-inducing, or manipulative language
- **THEN** the app SHALL continue to function with location-dependent features disabled

#### Scenario: Camera permission denied
- **WHEN** the user denies camera permission and a permission denial alert is shown
- **THEN** the alert SHALL include a "Cancel" button with `style: 'cancel'` that dismisses the alert without action
- **THEN** the alert SHALL include an "Open Settings" button that opens the device Settings app
- **THEN** the "Cancel" button SHALL appear before the "Open Settings" button in the button array

#### Scenario: Photo library permission denied
- **WHEN** the user denies photo library permission and a permission denial alert is shown
- **THEN** the alert SHALL include a "Cancel" button with `style: 'cancel'` that dismisses the alert without action
- **THEN** the alert SHALL include an "Open Settings" button that opens the device Settings app
- **THEN** the "Cancel" button SHALL appear before the "Open Settings" button in the button array
