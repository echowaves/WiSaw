## ADDED Requirements

### Requirement: Unnamed friend shows assignment hint
When a `FriendCard` renders with no contact name (friend displays as "Unnamed Friend"), it SHALL display a subtitle "Long-press to assign a name" below the display name to guide the user.

#### Scenario: Friend has no contact name
- **WHEN** `FriendCard` renders with a friend whose `contact` is null or undefined
- **THEN** the text "Unnamed Friend" SHALL be displayed as the name
- **THEN** a subtitle "Long-press to assign a name" SHALL be displayed below the name in a secondary text style

#### Scenario: Friend has a contact name
- **WHEN** `FriendCard` renders with a friend whose `contact` is set (e.g., "Alice")
- **THEN** the subtitle SHALL NOT be displayed
