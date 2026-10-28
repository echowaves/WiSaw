# Chat Messaging Specification

## Purpose
Chat messaging provides private, real-time direct message threads between confirmed friends. Users can exchange text messages and photos with live delivery via WebSocket subscriptions, infinite scroll pagination, and gesture-based interactions with haptic feedback.

## Requirements

### Requirement: Direct Message Interface
The system SHALL provide a private message thread interface for each confirmed friendship with chronological message display.

#### Scenario: User opens a chat
- **WHEN** the user taps on a friend in the friend list
- **THEN** the direct message thread with that friend is displayed

### Requirement: Real-Time Message Delivery
The system SHALL deliver and display messages in real-time via WebSocket subscriptions without requiring manual refresh.

#### Scenario: Friend sends a message
- **WHEN** a friend sends a message in the chat
- **THEN** the message appears immediately in the thread via WebSocket update

#### Scenario: User sends a message
- **WHEN** the user types and sends a message
- **THEN** the message is sent to the server and confirmed in the thread

### Requirement: Message Pagination
The system SHALL support infinite scroll backward pagination to load previous messages on demand.

#### Scenario: User scrolls up in chat
- **WHEN** the user scrolls to the top of the visible messages
- **THEN** older messages are fetched and appended to the thread

### Requirement: Photo Sharing in Chat
The system SHALL allow users to send images within message threads via camera capture or photo library selection.

#### Scenario: User sends a photo via camera
- **WHEN** the user taps the camera button in the chat and captures a photo
- **THEN** the photo is uploaded and sent as a message in the thread

#### Scenario: User sends a photo from library
- **WHEN** the user taps the photo library button and selects an image
- **THEN** the selected image is uploaded and sent as a message

### Requirement: Chat Deletion
The system SHALL allow users to delete entire chat threads with a confirmation dialog.

#### Scenario: User deletes a chat
- **WHEN** the user triggers chat deletion and confirms the action
- **THEN** the entire chat thread is permanently removed

### Requirement: Swipe-to-Delete Gesture
The system SHALL support a swipe gesture for chat deletion with haptic feedback.

#### Scenario: User swipes on a chat
- **WHEN** the user performs a swipe-to-delete gesture on the chat
- **THEN** the delete action is triggered with haptic feedback confirmation

### Requirement: Message Loading States
The system SHALL display visual indicators for message fetching and sending states.

#### Scenario: Messages are loading
- **WHEN** messages are being fetched from the server
- **THEN** a loading indicator is displayed in the chat interface

### Requirement: Chat Theme Adaptation
The system SHALL adapt the chat interface colors and styling to match the current app theme (light or dark mode).

#### Scenario: Dark mode is active
- **WHEN** the user has dark mode enabled
- **THEN** the chat interface renders with dark theme colors and appropriate contrast

### Requirement: Chat offline card
The Chat screen SHALL read `STATE.netAvailable` via `useAtom`. When `netAvailable` is `false`, it SHALL display an `EmptyStateCard` with `icon='wifi-off'` instead of attempting to load messages or connect WebSocket subscriptions.

#### Scenario: Chat renders offline card
- **WHEN** `netAvailable` is `false`
- **THEN** the Chat screen SHALL display an offline `EmptyStateCard`
- **THEN** it SHALL NOT fire GraphQL queries or establish WebSocket subscriptions

#### Scenario: Chat loads normally when online
- **WHEN** `netAvailable` is `true`
- **THEN** the Chat screen SHALL render its normal messaging interface
