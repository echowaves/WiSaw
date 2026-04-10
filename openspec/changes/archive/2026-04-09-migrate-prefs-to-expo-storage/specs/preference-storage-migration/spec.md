## ADDED Requirements

### Requirement: Non-sensitive preferences use filesystem storage
The system SHALL store non-sensitive user preferences using `expo-storage` (filesystem-based `Storage` API) instead of `expo-secure-store` (Keychain-based). Non-sensitive preferences include: theme preference, follow-system-theme flag, wave sort preferences, wave feed sort preferences, friend feed sort preferences, interaction hint shown flag, identity privacy explainer seen flag, and terms & conditions accepted flag.

#### Scenario: Preferences stored via filesystem on save
- **WHEN** any non-sensitive preference is saved
- **THEN** the system SHALL use `Storage.setItem({ key, value })` from `expo-storage`
- **THEN** the system SHALL NOT use `SecureStore.setItemAsync()`

#### Scenario: Preferences read via filesystem on load
- **WHEN** any non-sensitive preference is loaded at app startup or on demand
- **THEN** the system SHALL use `Storage.getItem({ key })` from `expo-storage`
- **THEN** the system SHALL NOT use `SecureStore.getItemAsync()`

#### Scenario: No timeout wrappers on filesystem reads
- **WHEN** a non-sensitive preference is loaded from expo-storage
- **THEN** the read SHALL NOT use `Promise.race` with a timeout
- **THEN** the read SHALL complete without artificial time limits

### Requirement: Sensitive identity data remains in SecureStore
The system SHALL continue to store UUID and NickName using `expo-secure-store` since these are device identity values.

#### Scenario: UUID stored in SecureStore
- **WHEN** a new UUID is generated or read
- **THEN** the system SHALL use `SecureStore.setItemAsync()` / `SecureStore.getItemAsync()`

#### Scenario: NickName stored in SecureStore
- **WHEN** a nickname is saved or loaded
- **THEN** the system SHALL use `SecureStore.setItemAsync()` / `SecureStore.getItemAsync()`

### Requirement: NickName read has no artificial timeout
The `getStoredNickName()` function SHALL NOT use a `Promise.race` timeout wrapper. The `Promise.allSettled` in app startup provides sufficient protection against hangs.

#### Scenario: NickName read on cold start
- **WHEN** the app initializes and reads the stored nickname
- **THEN** the read SHALL await `SecureStore.getItemAsync()` directly without a timeout race

### Requirement: UUID read has no artificial timeout
The `getUUID()` function SHALL NOT use a `Promise.race` timeout wrapper. The `Promise.allSettled` in app startup provides sufficient protection against hangs.

#### Scenario: UUID read on cold start
- **WHEN** the app initializes and reads the stored UUID
- **THEN** the read SHALL await `SecureStore.getItemAsync()` directly without a timeout race
