## MODIFIED Requirements

### Requirement: Location Provider Hook
The system SHALL provide a `useLocationProvider` hook at `src/hooks/useLocationProvider.js` that manages location permission, fast-seed, watcher lifecycle, and atom updates. It SHALL be called once from the root `_layout.tsx`. The permission request SHALL handle Mac Catalyst where `requestForegroundPermissionsAsync` hangs by falling back to `getForegroundPermissionsAsync` with a timeout.

#### Scenario: App startup permission request
- **WHEN** `useLocationProvider` is called on app mount
- **THEN** it SHALL call `Location.requestForegroundPermissionsAsync()` with a ~5 second timeout via `Promise.race`
- **THEN** if the call resolves within the timeout, use the returned status
- **THEN** if the call times out (Mac Catalyst), it SHALL fall back to `Location.getForegroundPermissionsAsync()` with the same timeout
- **THEN** if the fallback also times out, it SHALL assume `'granted'`
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
The system SHALL show distinct UI when location permission is denied, prompting the user to enable location access. The alert SHALL include both an "Open Settings" button (for iOS) and text instructions for macOS (System Settings → Privacy & Security → Location Services), since the same app binary runs on both platforms via Mac Catalyst.

#### Scenario: Permission denied alert
- **WHEN** the user denies location permission on any platform
- **THEN** an Alert SHALL be shown explaining that location is needed for nearby photos
- **THEN** the alert SHALL include an "Open Settings" button that calls `Linking.openSettings()`
- **THEN** the alert SHALL include text instructions for macOS users to navigate System Settings → Privacy & Security → Location Services
- **THEN** the alert SHALL include an "OK" dismiss button
