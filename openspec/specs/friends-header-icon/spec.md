## Requirements

### Requirement: Friends header icon renders with badge
The `FriendsHeaderIcon` component SHALL render a 40×40 touchable area containing a `user-friends` FontAwesome5 icon at size 22. When `friendsUnreadCount` atom is greater than 0, the icon SHALL display in `MAIN_COLOR` and show a red dot badge (10×10, positioned top-right). When unread count is 0 or null, the icon SHALL display in `theme.TEXT_SECONDARY` with no badge.

#### Scenario: Unread messages exist
- **WHEN** the `friendsUnreadCount` Jotai atom is greater than 0
- **THEN** the icon SHALL render in `MAIN_COLOR`
- **THEN** a red dot badge (10×10, border-radius 5, backgroundColor #FF3B30) SHALL appear at position top:4, right:4
- **THEN** the badge SHALL have a 2px border matching `theme.HEADER_BACKGROUND`

#### Scenario: No unread messages
- **WHEN** the `friendsUnreadCount` Jotai atom is 0 or null
- **THEN** the icon SHALL render in `theme.TEXT_SECONDARY`
- **THEN** no badge SHALL be displayed

#### Scenario: Icon press navigates to friends
- **WHEN** the user presses the `FriendsHeaderIcon`
- **THEN** the app SHALL navigate to `/friends` via `router.navigate`

### Requirement: Friends unread count global atom
The app SHALL expose a `friendsUnreadCount` Jotai atom in `src/state.js` initialized to `null`. `PhotosList/index.js` SHALL write the computed total unread count to this atom during feed reload. `FriendsHeaderIcon` SHALL read from this atom to drive badge rendering.

#### Scenario: Atom is populated during feed reload
- **WHEN** `PhotosList` completes its `reload()` sequence
- **THEN** the total unread friend message count SHALL be written to the `friendsUnreadCount` atom
- **THEN** `FriendsHeaderIcon` SHALL re-render reactively to reflect the new count
