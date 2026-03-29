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
The system SHALL provide an identity screen with two distinct visual states: a creation flow when no identity exists, and an active-identity profile view when an identity is established. The creation flow subtitle SHALL explicitly state that no personal information is ever stored on the server, and that the secret is the only way to access the identity.

#### Scenario: User opens identity screen with no identity
- **WHEN** the user navigates to the identity screen from the drawer menu and has no stored nickname
- **THEN** the system SHALL display a creation flow with a subtitle stating: "We never store any personal information on our servers. Your secret is the only way to access your identity — write it down and keep it safe."

#### Scenario: User opens identity screen with established identity
- **WHEN** the user navigates to the identity screen from the drawer menu and has a stored nickname
- **THEN** the system SHALL display an `IdentityProfileCard` showing the nickname and identity status, followed by action rows for "Change Secret" and "Reset Identity"

#### Scenario: Creation flow uses EmptyStateCard visual pattern
- **WHEN** the identity creation flow renders
- **THEN** it SHALL use the same visual language as `EmptyStateCard` — centered card with icon circle (`borderRadius: 60`, orange-tinted background), heading text, subtitle, and themed card styling (`CARD_BACKGROUND`, `borderRadius: 24`, shadows)

#### Scenario: Active identity view uses card-based layout
- **WHEN** the active identity view renders
- **THEN** all sections SHALL use card-based layouts with `borderRadius: 16`, `theme.CARD_BACKGROUND`, `theme.CARD_SHADOW`, and `theme.BORDER_LIGHT` consistent with the Waves feature styling

### Requirement: Privacy notice card communicates zero-PII guarantee
The `PrivacyNoticeCard` SHALL explicitly state that no personal information is stored on the server and frame secret unrecoverability as a direct consequence of the privacy-by-design architecture.

#### Scenario: Privacy notice card content
- **WHEN** the `PrivacyNoticeCard` is displayed on the identity screen
- **THEN** it SHALL include text stating that no personal information is stored on the servers, that the secret is the only key to the identity, and that lost secrets cannot be recovered

### Requirement: Reset confirmation dialog explains why recovery is impossible
The reset identity confirmation dialog SHALL explicitly explain that recovery is impossible because the system never stores personal information, not merely that "we cannot help you."

#### Scenario: Reset dialog copy
- **WHEN** the user taps "Reset Identity" and the confirmation Alert is displayed
- **THEN** the alert message SHALL state that identity recovery is impossible because no personal information is stored, and advise the user to have their secret written down before proceeding

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
