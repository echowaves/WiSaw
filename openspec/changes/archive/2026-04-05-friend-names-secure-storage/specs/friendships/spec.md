## MODIFIED Requirements

### Requirement: Local Friend Storage
The system SHALL persist friend names locally using `expo-secure-store` for privacy, offline access, and persistence across app reinstalls and device migrations. The system SHALL lazily migrate existing friend names from `expo-storage` to `expo-secure-store` on first read.

#### Scenario: App restarts
- **WHEN** the user closes and reopens the app
- **THEN** all saved friend names SHALL be restored from `expo-secure-store`

#### Scenario: App reinstalled on same device
- **WHEN** the user deletes and reinstalls the app on the same iOS device
- **THEN** all previously saved friend names SHALL be available from Keychain via `expo-secure-store`

#### Scenario: Device migration (iOS)
- **WHEN** the user migrates to a new iOS device via encrypted backup or iCloud Keychain sync
- **THEN** friend names stored in `expo-secure-store` SHALL be available on the new device

#### Scenario: Read with lazy migration from expo-storage
- **WHEN** a friend name is not found in `expo-secure-store` but exists in `expo-storage`
- **THEN** the system SHALL read the name from `expo-storage`, write it to `expo-secure-store`, delete it from `expo-storage`, and return the name

#### Scenario: Read when name exists in secure store
- **WHEN** a friend name is found in `expo-secure-store`
- **THEN** the system SHALL return it directly without checking `expo-storage`

#### Scenario: Write new friend name
- **WHEN** a new friend name is saved
- **THEN** the system SHALL write it to `expo-secure-store` and remove any existing entry from `expo-storage`

#### Scenario: Delete friend name
- **WHEN** a friend is deleted
- **THEN** the system SHALL remove the name from both `expo-secure-store` and `expo-storage`

## ADDED Requirements

### Requirement: Secure store migration resilience
The system SHALL gracefully handle migration failures, preserving the `expo-storage` entry if the `expo-secure-store` write fails.

#### Scenario: Secure store write fails during migration
- **WHEN** a friend name is read from `expo-storage` and the write to `expo-secure-store` fails
- **THEN** the `expo-storage` entry SHALL NOT be deleted
- **THEN** the name SHALL still be returned to the caller
