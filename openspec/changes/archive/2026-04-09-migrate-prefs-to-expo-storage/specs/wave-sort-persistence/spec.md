## MODIFIED Requirements

### Requirement: Wave sort preferences persist across app restarts
The system SHALL save the user's wave list sort preferences (sortBy and sortDirection) to device storage whenever the user changes them, and SHALL restore those preferences when the app starts.

#### Scenario: User changes sort order and restarts app
- **WHEN** user selects "Created, Oldest First" sort option on the Waves screen and restarts the app
- **THEN** the Waves screen SHALL display waves sorted by `createdAt` ascending on initial landing

#### Scenario: First-time user with no stored preference
- **WHEN** user has never changed the sort order (no stored preference exists)
- **THEN** the Waves screen SHALL default to sorting by `updatedAt` descending

#### Scenario: Storage read fails
- **WHEN** the device storage read fails
- **THEN** the system SHALL fall back to the default sort (`updatedAt` descending) without blocking app startup

## REMOVED Requirements

### Requirement: Storage read timeout fallback
**Reason**: Timeout wrappers are no longer needed because storage reads now use `expo-storage` (filesystem I/O) which does not have the iOS Keychain cold-start delay that necessitated timeouts.
**Migration**: Remove `Promise.race` timeout pattern from all wave sort preference load functions. Error handling via try/catch is sufficient.
