# Pending Friends Card Specification

## Purpose
Groups pending friend requests into a single card displayed at the top of the friends list.

## Requirements

### Requirement: PendingFriendsCard groups pending friends
The `PendingFriendsCard` component SHALL render a dashed-border card with tinted background (matching `UngroupedPhotosCard` styling) that groups all pending friend requests. It SHALL display a header with a clock icon and "Pending Friends (N)" count. It SHALL only render when there are pending friends.

#### Scenario: Display pending friends card
- **WHEN** there are 3 pending friends
- **THEN** the card SHALL display "Pending Friends (3)" in the header
- **THEN** each pending friend SHALL be listed with their name

#### Scenario: No pending friends
- **WHEN** there are no pending friends
- **THEN** the `PendingFriendsCard` SHALL NOT render

### Requirement: Pending friend items show status and share action
Each pending friend within the card SHALL display the friend's name, a "Waiting for confirmation" status line, an explanation text ("Share this link with your friend to establish the connection. Friend names are never stored on our servers — they are only kept locally on your device to ensure privacy and security."), and a "Share" button. The Share button SHALL re-share the friendship invitation link via `ShareOptionsModal`.

#### Scenario: Share button re-shares invitation
- **WHEN** the user taps "Share" on a pending friend
- **THEN** the `ShareOptionsModal` SHALL open with that friendship's UUID
- **THEN** the user can share the invitation link via the native share sheet or QR code

#### Scenario: Pending friend displays privacy-aware explanation
- **WHEN** a pending friend item renders
- **THEN** it SHALL display "Waiting for confirmation" as the status line
- **THEN** it SHALL display "Share this link with your friend to establish the connection. Friend names are never stored on our servers — they are only kept locally on your device to ensure privacy and security." as the explainer text
- **THEN** it SHALL display "When confirmed, you'll see each other's photos shared nearby"

### Requirement: Pending friend row has kebab menu button
Each pending friend row SHALL display a kebab menu button (`ellipsis-vertical` icon) at the bottom-right of the row. Tapping the kebab button SHALL trigger the same ActionMenu as long-pressing the row.

#### Scenario: Tapping kebab opens ActionMenu
- **WHEN** the user taps the kebab `⋮` button on a pending friend row
- **THEN** the ActionMenu SHALL open with "Share Link" and "Cancel Request" items

#### Scenario: Kebab button position
- **WHEN** a pending friend row renders
- **THEN** the kebab button SHALL appear at the bottom-right of the row
- **THEN** the Share button SHALL remain at the top-right inline with the friend name
