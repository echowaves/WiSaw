## MODIFIED Requirements

### Requirement: Friends header icon renders with badge
The `FriendsHeaderIcon` component SHALL render a 40×40 touchable area containing a `user-friends` FontAwesome5 icon at size 22. When the user has any friends (`friendsList.length > 0`), the icon SHALL display in `MAIN_COLOR`. When the user has no friends, the icon SHALL display in `theme.TEXT_SECONDARY`. The component SHALL read the `STATE.friendsList` atom. No badge indicator SHALL be displayed.

#### Scenario: User has friends
- **WHEN** the `friendsList` Jotai atom has length greater than 0
- **THEN** the icon SHALL render in `MAIN_COLOR`
- **THEN** no badge SHALL be displayed

#### Scenario: User has no friends
- **WHEN** the `friendsList` Jotai atom is empty
- **THEN** the icon SHALL render in `theme.TEXT_SECONDARY`
- **THEN** no badge SHALL be displayed

## REMOVED Requirements

### Requirement: Unread message badge on friends header icon
**Reason**: Chat has been removed. The `friendsUnreadCount` atom no longer exists. There is nothing to badge.
**Migration**: The icon renders based only on whether friends exist, with no badge indicator.
