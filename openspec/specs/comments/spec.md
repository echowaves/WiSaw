# Comments Specification

## Purpose
The comments system enables anonymous real-time engagement on photos through a comment thread interface with live WebSocket updates. Users can view, post, and interact with comments on any photo in the feed or via deep-linked shared photos.

## Requirements

### Requirement: Comment Posting
The system SHALL allow users to post anonymous comments on any photo via a modal input interface with a send button.

#### Scenario: User posts a comment
- **WHEN** the user opens the comment input modal, types a message, and taps send
- **THEN** the comment is submitted to the server and appears in the comment thread

#### Scenario: User submits empty comment
- **WHEN** the user taps send without entering text
- **THEN** the comment is not submitted and the input remains active

### Requirement: Real-Time Comment Updates
The system SHALL receive and display new comments in real-time via WebSocket subscriptions without requiring manual refresh.

#### Scenario: Another user posts a comment
- **WHEN** another user posts a comment on the same photo
- **THEN** the new comment appears in real-time in the comment thread

### Requirement: Comment Thread Display
The system SHALL display comments in chronological order with user display names and timestamps.

#### Scenario: User views photo comments
- **WHEN** the user opens a photo's comment thread
- **THEN** all existing comments are displayed in chronological order with names and timestamps

### Requirement: Shared Photo Comment Viewing
The system SHALL display comments on deep-linked shared photos with automatic refresh when the screen regains focus.

#### Scenario: User opens shared photo link
- **WHEN** the user opens a deep link to a shared photo
- **THEN** the photo's comments are displayed and refresh automatically when returning to the screen

### Requirement: Comment Input Modal
The system SHALL provide an interactive comment composer modal with a send button in the header for posting comments.

#### Scenario: User opens comment input
- **WHEN** the user taps the comment action on a photo
- **THEN** a modal input interface opens with a text field and send button
