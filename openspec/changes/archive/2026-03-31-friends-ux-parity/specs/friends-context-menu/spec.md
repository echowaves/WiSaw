## ADDED Requirements

### Requirement: FriendCard context menu via ActionMenu
Each friend row in the FriendsList SHALL support triggering an ActionMenu modal via both long-press on the row and tapping a visible ⋮ menu button. The ActionMenu SHALL replace the previous swipe-based actions entirely.

#### Scenario: User long-presses a confirmed friend
- **WHEN** the user long-presses on a confirmed friend row
- **THEN** an ActionMenu SHALL appear with items: "Share Name" (icon: share-alt), "Edit Name" (icon: pencil), separator, "Remove Friend" (destructive: true, icon: trash-can)

#### Scenario: User taps ⋮ on a confirmed friend
- **WHEN** the user taps the ⋮ button on a confirmed friend row
- **THEN** the same ActionMenu SHALL appear as for long-press

#### Scenario: User long-presses a pending friend
- **WHEN** the user long-presses on a pending friend row
- **THEN** an ActionMenu SHALL appear with items: "Share Link" (icon: share-alt), separator, "Cancel Request" (destructive: true, icon: trash-can)

#### Scenario: User taps ⋮ on a pending friend
- **WHEN** the user taps the ⋮ button on a pending friend row
- **THEN** the same ActionMenu SHALL appear as for long-press on a pending friend

### Requirement: Swipe gestures removed
The FriendsList SHALL NOT use PanGestureHandler or swipe-based gestures for friend actions. All action interactions SHALL be through ActionMenu.

#### Scenario: User attempts to swipe a friend row
- **WHEN** the user swipes horizontally on a friend row
- **THEN** no action stripes or swipe-based UI SHALL appear

### Requirement: FriendCard visual design
Each friend row SHALL display the friend's custom name (or "Unnamed Friend"), the friendship status indicator for pending friends, unread message count for confirmed friends, and a visible ⋮ menu button on the right edge.

#### Scenario: Confirmed friend with unread messages
- **WHEN** a confirmed friend has unread messages
- **THEN** the friend row SHALL display the unread count

#### Scenario: Pending friend display
- **WHEN** a friend is in pending state
- **THEN** the friend row SHALL display a clock icon and "Waiting for confirmation" status text
- **THEN** the ⋮ menu button SHALL still be visible
