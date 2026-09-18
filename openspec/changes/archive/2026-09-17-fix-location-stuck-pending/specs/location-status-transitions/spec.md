## MODIFIED Requirements

### Requirement: Location Atom Status Values
The `locationAtom` SHALL support the following status values: `pending`, `ready`, `denied`, `timeout`, and `unavailable`.

#### Scenario: Initial status is pending
- **WHEN** the app starts and `locationAtom` is initialized
- **THEN** the atom SHALL have value `{ status: 'pending', coords: null, accuracy: null }`

#### Scenario: Ready status
- **WHEN** a valid location fix has been obtained (via last-known position or watcher)
- **THEN** the atom SHALL have value `{ status: 'ready', coords: { latitude, longitude }, accuracy: <meters> }`
- **THEN** the `coords` object SHALL contain `latitude` and `longitude` properties as numbers
- **THEN** the `accuracy` property SHALL be a number representing horizontal accuracy in meters

#### Scenario: Denied status
- **WHEN** the user denies foreground location permission
- **THEN** the atom SHALL have value `{ status: 'denied', coords: null, accuracy: null }`

#### Scenario: Timeout status (NEW)
- **WHEN** the global initialization timeout (15 seconds) is reached before a location fix is obtained
- **THEN** the atom SHALL have value `{ status: 'timeout', coords: null, accuracy: null }`
- **THEN** the system SHALL continue running watchers in the background to eventually obtain a location fix
- **THEN** if a location fix is obtained after timeout, the status SHALL transition from 'timeout' to 'ready'

#### Scenario: Unavailable status (NEW)
- **WHEN** location services are disabled at the system level OR the first-fix watchdog restart budget (3 attempts) is exhausted without a fix
- **THEN** the atom SHALL have value `{ status: 'unavailable', coords: null, accuracy: null }`
- **THEN** the watchdog SHALL stop until the next foreground re-initialization
- **THEN** UI SHOULD show clear message that location is unavailable

### Requirement: Valid Status Transitions
The location atom SHALL only allow specific status transitions to ensure predictable behavior.

#### Scenario: Valid transitions from pending
- **WHEN** status is `pending`
- **THEN** valid transitions are: `pending` → `ready`, `pending` → `denied`, `pending` → `timeout`, `pending` → `unavailable`

#### Scenario: Valid transitions from ready
- **WHEN** status is `ready`
- **THEN** valid transitions are: `ready` → `denied` (permission revoked), `ready` → `unavailable` (services disabled)

#### Scenario: Valid transitions from timeout
- **WHEN** status is `timeout`
- **THEN** valid transitions are: `timeout` → `ready` (location fix obtained), `timeout` → `denied` (permission revoked), `timeout` → `unavailable` (watchdog budget exhausted while still initializing)

#### Scenario: Valid transitions from unavailable
- **WHEN** status is `unavailable`
- **THEN** valid transitions are: `unavailable` → `ready` (services re-enabled, location fix obtained via foreground re-initialization), `unavailable` → `denied` (permission re-check on foreground re-initialization reports denial)
- **NOTE:** `unavailable` → `timeout` is NOT a valid transition (the global initialization timeout has already elapsed; only a fix or a denial can change the state)

#### Scenario: Invalid transitions are ignored
- **WHEN** an invalid status transition is attempted
- **THEN** the atom SHALL NOT be updated
- **THEN** a dev-mode log SHALL be emitted: `[Location] Invalid status transition ignored: <from> → <to>`

### Requirement: Status-Based UI Behavior
Screens using location SHALL handle all five status values appropriately.

#### Scenario: Pending status UI
- **WHEN** `locationAtom.status === 'pending'`
- **THEN** UI SHALL show "Initializing location..." or equivalent message
- **THEN** location-dependent features SHALL be disabled or show loading state

#### Scenario: Timeout status UI
- **WHEN** `locationAtom.status === 'timeout'`
- **THEN** UI SHALL show a message indicating location is still being found in the background
- **THEN** the UI SHALL NOT render an empty screen without any explanatory state
- **THEN** UI MAY offer option to retry or check settings

#### Scenario: Unavailable status UI
- **WHEN** `locationAtom.status === 'unavailable'`
- **THEN** UI SHALL show clear message that location services are unavailable
- **THEN** UI SHALL provide an option to open device location settings

#### Scenario: Denied status UI
- **WHEN** `locationAtom.status === 'denied'`
- **THEN** UI SHALL show message that location permission is needed
- **THEN** UI SHALL include "Open Settings" button to redirect user to system settings

#### Scenario: Ready status UI
- **WHEN** `locationAtom.status === 'ready'`
- **THEN** UI SHALL enable all location-dependent features
- **THEN** UI SHALL display current location accuracy if relevant
