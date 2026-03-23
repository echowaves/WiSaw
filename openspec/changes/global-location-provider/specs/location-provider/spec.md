## ADDED Requirements

### Requirement: Location Atom
The system SHALL provide a global Jotai atom `locationAtom` in `src/state.js` that stores the device's location state as an object with `status` and `coords` properties.

#### Scenario: Initial atom state
- **WHEN** the app starts
- **THEN** the `locationAtom` SHALL have value `{ status: 'pending', coords: null }`

#### Scenario: Location obtained
- **WHEN** valid GPS coordinates are received (via last-known position or watcher)
- **THEN** the atom SHALL be set to `{ status: 'ready', coords: { latitude, longitude } }`

#### Scenario: Permission denied
- **WHEN** the user denies foreground location permission
- **THEN** the atom SHALL be set to `{ status: 'denied', coords: null }`

### Requirement: Location Provider Hook
The system SHALL provide a `useLocationProvider` hook at `src/hooks/useLocationProvider.js` that manages location permission, fast-seed, watcher lifecycle, and atom updates. It SHALL be called once from the root `_layout.tsx`.

#### Scenario: App startup permission request
- **WHEN** `useLocationProvider` is called on app mount
- **THEN** it SHALL call `Location.requestForegroundPermissionsAsync()`
- **THEN** if permission is granted, it SHALL proceed to fast-seed and watcher setup
- **THEN** if permission is denied, it SHALL set the atom to `{ status: 'denied', coords: null }`

#### Scenario: Fast-seed with last known position
- **WHEN** permission is granted
- **THEN** the hook SHALL call `Location.getLastKnownPositionAsync()`
- **THEN** if a valid position is returned, the atom SHALL be immediately set to `{ status: 'ready', coords: { latitude, longitude } }`
- **THEN** the watcher SHALL still be started to provide fresh position updates

#### Scenario: Watcher provides ongoing updates
- **WHEN** the watcher is running and the device position changes
- **THEN** the atom SHALL be updated with the new coordinates
- **THEN** updates SHALL occur at most every 100 meters of movement or every 60 seconds

#### Scenario: Watcher startup fails
- **WHEN** `Location.watchPositionAsync` throws an error
- **THEN** the hook SHALL wait 5 seconds and retry
- **THEN** the hook SHALL retry up to 3 times total
- **THEN** if all retries are exhausted, the atom SHALL remain in its current state

#### Scenario: Watcher cleanup on unmount
- **WHEN** the root layout unmounts (app closing)
- **THEN** the watcher subscription SHALL be removed to prevent memory leaks

### Requirement: Permission Denied UI
The system SHALL show distinct UI when location permission is denied, prompting the user to open Settings.

#### Scenario: Permission denied alert
- **WHEN** the user denies location permission
- **THEN** an Alert SHALL be shown explaining that location is needed for nearby photos
- **THEN** the alert SHALL include an "Open Settings" button that calls `Linking.openSettings()`
