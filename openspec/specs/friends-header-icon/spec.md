## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for friends header icon in WiSaw.

## Requirements

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

#### Scenario: Icon press navigates to friends
- **WHEN** the user presses the `FriendsHeaderIcon`
- **THEN** the app SHALL navigate to `/friends` via `router.navigate`
