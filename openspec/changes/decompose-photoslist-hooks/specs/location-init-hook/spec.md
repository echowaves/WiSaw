## ADDED Requirements

### Requirement: useLocationInit hook encapsulates location retrieval
The `useLocationInit` hook SHALL manage the `location` state and provide an `initLocation` function that requests foreground permissions and retrieves the device location.

#### Scenario: Hook returns location state and initializer
- **WHEN** `useLocationInit` is called with `{ toastTopOffset }`
- **THEN** it SHALL return `{ location, setLocation, initLocation }`

### Requirement: Location retrieval prefers last known position
The `initLocation` function SHALL first attempt `getLastKnownPositionAsync` for speed, falling back to `getCurrentPositionAsync` if unavailable.

#### Scenario: Last known position available
- **WHEN** `initLocation` is called and a last known position exists
- **THEN** `location` SHALL be set to the last known position and the position SHALL be returned

#### Scenario: Last known position unavailable
- **WHEN** `initLocation` is called and no last known position exists
- **THEN** `getCurrentPositionAsync` SHALL be called and `location` SHALL be set to its result

### Requirement: Permission denied shows Settings alert
The hook SHALL show an alert with "Open Settings" when foreground location permission is denied.

#### Scenario: Location permission denied
- **WHEN** `initLocation` is called and the user denies location permission
- **THEN** an Alert SHALL be shown explaining location is needed, with an "Open Settings" action

### Requirement: Location error shows toast
The hook SHALL show an error toast when location retrieval throws an exception.

#### Scenario: Location retrieval fails
- **WHEN** location APIs throw an error
- **THEN** a toast SHALL be shown with "Unable to get location" and `initLocation` SHALL return null
