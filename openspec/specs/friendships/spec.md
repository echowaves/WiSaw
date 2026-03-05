# Friendships Specification

## Purpose
The friendship system enables users to establish peer-to-peer connections via text-based deep links or QR codes, manage pending and confirmed friendships, edit friend display names, and store friend data securely on-device. Friendships enable private chat messaging between connected users.

## Requirements

### Requirement: Friend List Display
The system SHALL display a list of all friends organized by state (pending and confirmed) with their custom display names.

#### Scenario: User views friend list
- **WHEN** the user navigates to the friends screen
- **THEN** all friends are listed showing their custom names and friendship status

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
The system SHALL support a dual-state friendship model with pending and confirmed states, allowing users to accept or reject pending requests.

#### Scenario: User receives a pending friendship
- **WHEN** another user initiates a friendship
- **THEN** the friendship appears in the pending state in the friend list

#### Scenario: User confirms a pending friendship
- **WHEN** the user accepts a pending friendship request via the confirmation screen
- **THEN** the friendship moves to confirmed state and both parties can chat

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
The system SHALL persist friend names locally using expo-secure-store for privacy and offline access.

#### Scenario: App restarts
- **WHEN** the user closes and reopens the app
- **THEN** all saved friend names are restored from secure local storage
