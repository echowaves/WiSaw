## MODIFIED Requirements

### Requirement: Identity status in drawer menu item
The drawer's "Identity" menu item SHALL reflect the current identity state. When no identity is set, the item SHALL display the label "Set Up Identity" and show a red dot badge on the icon. When an identity is active, the item SHALL display the user's nickname as the label and show the icon in `MAIN_COLOR`. No functional changes — the header layout context changes (the right side now holds two icons: Waves and Friends) but the identity icon behavior is unchanged.

#### Scenario: Drawer item with no identity
- **WHEN** the drawer is opened and the user has no stored nickname
- **THEN** the Identity menu item SHALL display the label "Set Up Identity" and a red dot badge on the `user-secret` icon

#### Scenario: Drawer item with active identity
- **WHEN** the drawer is opened and the user has a stored nickname
- **THEN** the Identity menu item SHALL display the nickname as the label and the `user-secret` icon in `MAIN_COLOR` when the item is inactive

#### Scenario: Header identity icon unchanged
- **WHEN** the PhotosList header is rendered
- **THEN** the `IdentityHeaderIcon` SHALL remain in the left position of the header
- **THEN** the dropdown behavior SHALL be unchanged
- **THEN** the right side of the header SHALL contain both `WaveHeaderIcon` and `FriendsHeaderIcon` in a row
