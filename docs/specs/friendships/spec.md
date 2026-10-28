# Friendships Specification

## Purpose
The friendship system enables users to establish peer-to-peer connections via text-based deep links or QR codes, manage pending and confirmed friendships, edit friend display names, and store friend data securely on-device. Friendships enable private photo sharing between connected users.

## Requirements

### Requirement: Friend List Display
The system SHALL display a list of all friends organized by state (pending always first, then confirmed sorted by user-selected sort option) with their custom display names, a visible ⋮ menu button on each row, a LinearProgress loading bar during fetch, an InteractionHintBanner for interaction discovery, a KeyboardStickyView search bar at the bottom, and a FriendsExplainerView when the list is empty.

#### Scenario: User views friend list
- **WHEN** the user navigates to the friends screen
- **THEN** all pending friends SHALL appear at the top of the list
- **THEN** all confirmed friends SHALL appear below, sorted by the active sort option
- **THEN** each friend row SHALL display a ⋮ menu button on the right edge
- **THEN** a search bar SHALL appear at the bottom of the screen (if friends exist)
- **THEN** an InteractionHintBanner SHALL appear (if not previously dismissed)

#### Scenario: User views empty friend list
- **WHEN** the user navigates to the friends screen and has no friends
- **THEN** the system SHALL display FriendsExplainerView with educational content and an "Add a Friend" CTA
- **THEN** the search bar SHALL NOT be displayed

### Requirement: Friendship via Text Link
The system SHALL allow users to share friendship invitations via standard text-based deep links that can be sent through any messaging platform.

#### Scenario: User sends friendship link
- **WHEN** the user taps the share friendship button
- **THEN** a deep link is generated and the native share sheet opens for distribution

#### Scenario: Recipient opens friendship link
- **WHEN** a user opens a received friendship deep link
- **THEN** the app opens the friendship confirmation screen

### Requirement: Friendship via QR Code
The system SHALL allow users to generate and share QR codes for quick friend synchronization across devices.

#### Scenario: User generates QR code
- **WHEN** the user taps the QR code sharing option
- **THEN** a QR code containing the friendship invitation data is generated and displayed

#### Scenario: User scans QR code
- **WHEN** a user scans a friendship QR code
- **THEN** the friendship confirmation flow is initiated

### Requirement: Pending Friendship Management
The system SHALL support a dual-state friendship model with pending and confirmed states, allowing users to accept or reject pending requests. The `acceptFriendshipRequest` GraphQL mutation SHALL use a flat selection set matching the backend's `Friendship!` return type (no wrapper field), and the client SHALL read the response directly from `result.data.acceptFriendshipRequest`.

#### Scenario: User receives a pending friendship
- **WHEN** another user initiates a friendship
- **THEN** the friendship appears in the pending state in the friend list

#### Scenario: User confirms a pending friendship
- **WHEN** the user accepts a pending friendship request via the confirmation screen
- **THEN** the client SHALL send an `acceptFriendshipRequest` mutation with a flat selection set (`createdAt`, `friendshipUuid`, `uuid1`, `uuid2`) matching the `Friendship` type
- **THEN** the client SHALL read the friendship object directly from `result.data.acceptFriendshipRequest`
- **THEN** the friendship moves to confirmed state and both parties can see each other's shared photos

#### Scenario: Backend rejects invalid mutation
- **WHEN** the client sends a mutation with fields not defined on the `Friendship` type
- **THEN** AppSync SHALL return a validation error before the resolver executes

### Requirement: Friend Name Editing
The system SHALL allow users to set and edit custom display names for their friends.

#### Scenario: User edits a friend name
- **WHEN** the user taps the edit name option on a friend
- **THEN** a name picker modal appears allowing the user to set a custom display name

#### Scenario: No name set for friend
- **WHEN** a friend has no custom name assigned
- **THEN** the friend is displayed as "Unnamed Friend"

### Requirement: Friend Removal
The system SHALL allow users to delete friends with a confirmation dialog.

#### Scenario: User deletes a friend
- **WHEN** the user taps delete on a friend and confirms the action
- **THEN** the friendship is removed and the friend disappears from the list

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

### Requirement: Secure store migration resilience
The system SHALL gracefully handle migration failures, preserving the `expo-storage` entry if the `expo-secure-store` write fails.

#### Scenario: Secure store write fails during migration
- **WHEN** a friend name is read from `expo-storage` and the write to `expo-secure-store` fails
- **THEN** the `expo-storage` entry SHALL NOT be deleted
- **THEN** the name SHALL still be returned to the caller

### Requirement: NamePicker keyboard avoidance library
The NamePicker modal SHALL use `KeyboardAwareScrollView` from `react-native-keyboard-controller` instead of `react-native-keyboard-aware-scroll-view`.

#### Scenario: Name input remains visible when keyboard opens
- **WHEN** a user taps the name input field in the NamePicker modal
- **THEN** the modal content SHALL scroll so the input remains visible above the keyboard

### Requirement: FriendsList offline card
The FriendsList screen SHALL read `STATE.netAvailable` via `useAtom`. When `netAvailable` is `false`, it SHALL display an `EmptyStateCard` with `icon='wifi-off'` instead of attempting to load friends or fire friend-related API calls.

#### Scenario: FriendsList renders offline card
- **WHEN** `netAvailable` is `false`
- **THEN** the FriendsList screen SHALL display an offline `EmptyStateCard`
- **THEN** it SHALL NOT call `friends_helper` API functions

#### Scenario: FriendsList loads normally when online
- **WHEN** `netAvailable` is `true`
- **THEN** the FriendsList screen SHALL render its normal friends list
