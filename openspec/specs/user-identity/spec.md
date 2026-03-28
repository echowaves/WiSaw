# User Identity Specification

## Purpose
User identity in WiSaw is anonymous and device-based. Each device receives a unique UUID for content association without requiring user accounts, registration, or persistent profiles. Users may optionally set a display nickname stored securely on-device.

## Requirements

### Requirement: Device-Based Identity
The system SHALL assign each device a unique UUID that serves as the user's identity for all content operations, without requiring registration or account creation.

#### Scenario: First app launch
- **WHEN** the app is launched for the first time on a new device
- **THEN** a unique UUID is generated and persisted for that device

#### Scenario: Subsequent app launches
- **WHEN** the app is reopened on the same device
- **THEN** the previously assigned UUID is restored and used

### Requirement: Anonymous Content Posting
The system SHALL allow users to share photos and post comments without revealing any personal identity beyond their optional nickname.

#### Scenario: User posts content
- **WHEN** a user uploads a photo or posts a comment
- **THEN** the content is associated with the device UUID, not any personal identity

### Requirement: Optional Nickname
The system SHALL allow users to set an optional display name (nickname) that is not required for app usage.

#### Scenario: User sets a nickname
- **WHEN** the user navigates to the identity screen and sets a nickname
- **THEN** the nickname is saved and used as the display name for their content

#### Scenario: User has no nickname
- **WHEN** a user has not set a nickname
- **THEN** their content displays without a name or with a default anonymous indicator

### Requirement: Identity Management Screen
The system SHALL provide an identity screen where users can view and manage their device nickname and identity settings.

#### Scenario: User opens identity screen
- **WHEN** the user navigates to the identity screen from the drawer menu
- **THEN** the current nickname and identity settings are displayed and editable

### Requirement: Secure Identity Storage
The system SHALL store the device UUID and nickname securely using expo-secure-store.

#### Scenario: Sensitive data is stored
- **WHEN** the UUID or nickname is persisted
- **THEN** the data is stored in the device's secure enclave via expo-secure-store

### Requirement: Secret screen keyboard avoidance library
The Secret screen form SHALL use `KeyboardAwareScrollView` from `react-native-keyboard-controller` instead of `react-native-keyboard-aware-scroll-view`.

#### Scenario: Secret input fields remain visible when keyboard opens
- **WHEN** a user taps any input field on the Secret screen
- **THEN** the screen content SHALL scroll so the focused input remains visible above the keyboard

### Requirement: Secret screen offline card
The Secret (Identity) screen SHALL read `STATE.netAvailable` via `useAtom`. When `netAvailable` is `false`, it SHALL display an `EmptyStateCard` with `icon='wifi-off'` instead of allowing identity operations that require the network.

#### Scenario: Secret renders offline card
- **WHEN** `netAvailable` is `false`
- **THEN** the Secret screen SHALL display an offline `EmptyStateCard`
- **THEN** it SHALL NOT attempt network-dependent identity operations

#### Scenario: Secret loads normally when online
- **WHEN** `netAvailable` is `true`
- **THEN** the Secret screen SHALL render its normal identity management interface
