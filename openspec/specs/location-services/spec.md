# Location Services Specification

## Purpose
Location services provide GPS-based functionality for the WiSaw platform, including permission handling via a global location provider, location-based feed filtering to show nearby photos, and continuous foreground location tracking via `watchPositionAsync`.

## Requirements

### Requirement: GPS Permission Handling
The system SHALL request and manage location permissions at app startup via the global `useLocationProvider` hook, storing the result in the `locationAtom`. Permission is requested once from the root layout, not per-screen. When permission is denied, the system SHALL display an informative, non-pressuring alert explaining why location is needed, with an optional "Open Settings" convenience button.

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

### Requirement: Location-Based Feed Filtering
The system SHALL filter the photo feed to show content from users near the current GPS coordinates, reading from the global `locationAtom`.

#### Scenario: User has location enabled
- **WHEN** the `locationAtom` status is `ready` and the feed is loaded
- **THEN** only photos within the configured proximity radius of the user's coordinates are displayed

#### Scenario: Location changes significantly
- **WHEN** the watcher updates the `locationAtom` with new coordinates (100m+ movement)
- **THEN** the feed content SHALL automatically reload to reflect nearby photos at the new location

### Requirement: Location Validation Before Photo Capture
The system SHALL validate that the `locationAtom` has `status: 'ready'` before permitting any photo capture or upload. Camera and video buttons SHALL be visible but disabled when location is not ready.

#### Scenario: Location not yet available
- **WHEN** the user views a screen with camera buttons and `locationAtom.status` is `pending`
- **THEN** camera and video buttons SHALL be visible but disabled (opacity 0.4)
- **THEN** tapping a disabled button SHALL have no effect

#### Scenario: Location permission denied
- **WHEN** `locationAtom.status` is `denied`
- **THEN** camera and video buttons SHALL be visible but disabled (opacity 0.4)

#### Scenario: Location is valid
- **WHEN** `locationAtom.status` is `ready`
- **THEN** camera and video buttons SHALL be enabled
- **THEN** photo capture SHALL be permitted
- **THEN** the valid coordinates from `locationAtom.coords` SHALL be attached to the queued upload item
