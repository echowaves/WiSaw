## MODIFIED Requirements

### Requirement: Location Provider Hook
The system SHALL provide a `useLocationProvider` hook at `src/hooks/useLocationProvider.js` that manages location permission, fast-seed, watcher lifecycle, and atom updates. It SHALL be called once from the root `_layout.tsx`. If neither `getLastKnownPositionAsync` nor `watchPositionAsync` provide a position within a timeout period (~10 seconds), the hook SHALL fall back to `getCurrentPositionAsync` with `Accuracy.Lowest` to force a one-shot position resolution.

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

#### Scenario: Position timeout fallback
- **WHEN** permission is granted and ~10 seconds elapse without the atom reaching `status: 'ready'`
- **THEN** the hook SHALL call `Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Lowest })`
- **THEN** if successful, the atom SHALL be set to `{ status: 'ready', coords: { latitude, longitude } }`
- **THEN** the watcher SHALL continue running for future position updates

#### Scenario: Position timeout fallback also fails
- **WHEN** `getCurrentPositionAsync` fails or times out
- **THEN** the atom SHALL remain in `{ status: 'pending', coords: null }`
- **THEN** the watcher SHALL continue attempting to provide position updates

#### Scenario: Watcher cleanup on unmount
- **WHEN** the root layout unmounts (app closing)
- **THEN** the watcher subscription SHALL be removed to prevent memory leaks
- **THEN** any pending timeout SHALL be cleared

### Requirement: Permission Denied UI
The system SHALL show distinct UI when location permission is denied, prompting the user to enable location access. On iOS/Android, it SHALL show an alert with an "Open Settings" button. On macOS, it SHALL provide text instructions for enabling Location Services in System Settings since `Linking.openSettings()` may not navigate to the correct pane.

#### Scenario: Permission denied alert on mobile
- **WHEN** the user denies location permission on iOS or Android
- **THEN** an Alert SHALL be shown explaining that location is needed for nearby photos
- **THEN** the alert SHALL include an "Open Settings" button that calls `Linking.openSettings()`

#### Scenario: Permission denied message on macOS
- **WHEN** the user denies location permission on macOS
- **THEN** an Alert SHALL be shown explaining that location is needed
- **THEN** the alert SHALL include instructions to enable Location Services in macOS System Settings → Privacy & Security → Location Services
