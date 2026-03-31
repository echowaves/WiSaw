## MODIFIED Requirements

### Requirement: Friends header icon renders with badge
The `FriendsHeaderIcon` component SHALL render a 40×40 touchable area containing a `user-friends` FontAwesome5 icon at size 22. When the user has any friends (`friendsList.length > 0`), the icon SHALL display in `MAIN_COLOR`. When the user has no friends, the icon SHALL display in `theme.TEXT_SECONDARY`. When `friendsUnreadCount` atom is greater than 0, a red dot badge (10×10, positioned top-right) SHALL be displayed. The icon SHALL read both `STATE.friendsList` and `STATE.friendsUnreadCount` atoms.

#### Scenario: User has friends with no unread messages
- **WHEN** the `friendsList` Jotai atom has length greater than 0
- **AND** the `friendsUnreadCount` Jotai atom is 0 or null
- **THEN** the icon SHALL render in `MAIN_COLOR`
- **THEN** no badge SHALL be displayed

#### Scenario: User has friends with unread messages
- **WHEN** the `friendsList` Jotai atom has length greater than 0
- **AND** the `friendsUnreadCount` Jotai atom is greater than 0
- **THEN** the icon SHALL render in `MAIN_COLOR`
- **THEN** a red dot badge (10×10, border-radius 5, backgroundColor #FF3B30) SHALL appear at position top:4, right:4
- **THEN** the badge SHALL have a 2px border matching `theme.HEADER_BACKGROUND`

#### Scenario: User has no friends
- **WHEN** the `friendsList` Jotai atom is empty
- **THEN** the icon SHALL render in `theme.TEXT_SECONDARY`
- **THEN** no badge SHALL be displayed

#### Scenario: Icon press navigates to friends
- **WHEN** the user presses the `FriendsHeaderIcon`
- **THEN** the app SHALL navigate to `/friends` via `router.navigate`
