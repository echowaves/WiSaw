## ADDED Requirements

### Requirement: PendingFriendsCard groups pending friends
The `PendingFriendsCard` component SHALL render a dashed-border card with tinted background (matching `UngroupedPhotosCard` styling) that groups all pending friend requests. It SHALL display a header with a clock icon and "Pending Friends (N)" count. It SHALL only render when there are pending friends.

#### Scenario: Display pending friends card
- **WHEN** there are 3 pending friends
- **THEN** the card SHALL display "Pending Friends (3)" in the header
- **THEN** each pending friend SHALL be listed with their name

#### Scenario: No pending friends
- **WHEN** there are no pending friends
- **THEN** the `PendingFriendsCard` SHALL NOT render

### Requirement: Pending friend items show status and remind action
Each pending friend within the card SHALL display the friend's name, a "Waiting for confirmation" status line, an explanation text ("When confirmed, you'll see each other's photos shared nearby"), and a "Remind" button. The Remind button SHALL re-share the friendship invitation link via `ShareOptionsModal`.

#### Scenario: Remind button re-shares invitation
- **WHEN** the user taps "Remind" on a pending friend
- **THEN** the `ShareOptionsModal` SHALL open with that friendship's UUID
- **THEN** the user can share the invitation link via the native share sheet or QR code

#### Scenario: Pending friend displays explanation
- **WHEN** a pending friend item renders
- **THEN** it SHALL display "Waiting for confirmation" with a clock indicator
- **THEN** it SHALL display "When confirmed, you'll see each other's photos shared nearby"
