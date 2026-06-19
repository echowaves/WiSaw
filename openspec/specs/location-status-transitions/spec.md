## Purpose
This specification defines all valid status transitions for the `locationAtom` state, including new status values for better initialization state tracking.

## Requirements

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
- **WHEN** location services are disabled at the system level OR the watcher fails after all retries
- **THEN** the atom SHALL have value `{ status: 'unavailable', coords: null, accuracy: null }`
- **THEN** the system SHALL NOT attempt to restart watchers
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
- **THEN** valid transitions are: `timeout` → `ready` (location fix obtained), `timeout` → `denied` (permission revoked), `timeout` → `unavailable` (services disabled)

#### Scenario: Valid transitions from unavailable
- **WHEN** status is `unavailable`
- **THEN** valid transitions are: `unavailable` → `ready` (services re-enabled, location fix obtained)
- **NOTE:** `unavailable` → `denied` is NOT a valid transition (permission and services availability are separate)

#### Scenario: Invalid transitions are ignored
- **WHEN** an invalid status transition is attempted
- **THEN** the atom SHALL NOT be updated
- **THEN** a dev-mode log SHALL be emitted: `[Location] Invalid status transition ignored: <from> → <to>`

### Requirement: Status Transition Logging
The location provider SHALL log status transitions to assist with debugging.

#### Scenario: Status transition logging format
- **WHEN** the status property of `locationAtom` changes
- **THEN** a console log SHALL be emitted with format: `[Location] Status change: <oldStatus> → <newStatus>`

#### Scenario: Status change with coordinates
- **WHEN** the status changes to `ready` or `unavailable` with coordinates
- **THEN** the log SHALL include coordinates: `[Location] Status change: <oldStatus> → <newStatus> @ <lat>, <lon> (accuracy: <acc>m)`

### Requirement: Status-Based UI Behavior
Screens using location SHALL handle all five status values appropriately.

#### Scenario: Pending status UI
- **WHEN** `locationAtom.status === 'pending'`
- **THEN** UI SHALL show "Initializing location..." or equivalent message
- **THEN** location-dependent features SHALL be disabled or show loading state

#### Scenario: Timeout status UI
- **WHEN** `locationAtom.status === 'timeout'`
- **THEN** UI SHALL show message indicating location is still initializing in background
- **THEN** UI MAY offer option to retry or check settings

#### Scenario: Unavailable status UI
- **WHEN** `locationAtom.status === 'unavailable'`
- **THEN** UI SHALL show clear message that location services are unavailable
- **THEN** UI SHALL provide option to check location settings

#### Scenario: Denied status UI
- **WHEN** `locationAtom.status === 'denied'`
- **THEN** UI SHALL show message that location permission is needed
- **THEN** UI SHALL include "Open Settings" button to redirect user to system settings

#### Scenario: Ready status UI
- **WHEN** `locationAtom.status === 'ready'`
- **THEN** UI SHALL enable all location-dependent features
- **THEN** UI SHALL display current location accuracy if relevant

### Requirement: Backward Compatibility
Existing code that only checks for `pending`, `ready`, and `denied` statuses SHALL continue to work without modification.

#### Scenario: Legacy status checks
- **WHEN** code checks `locationAtom.status === 'pending'` or `locationAtom.status === 'ready'`
- **THEN** the check SHALL work the same as before this change
- **NOTE:** New status values (`timeout`, `unavailable`) may require updated handling

#### Scenario: Default case handling
- **WHEN** code uses `switch` statement with `default` case for unknown statuses
- **THEN** the `default` case SHALL handle `timeout` and `unavailable` appropriately
- **NOTE:** It is recommended to explicitly handle all five status values
