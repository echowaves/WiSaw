## ADDED Requirements

### Requirement: Identity status in drawer menu item
The drawer's "Identity" menu item SHALL reflect the current identity state. When no identity is set, the item SHALL display the label "Set Up Identity" and show a red dot badge on the icon. When an identity is active, the item SHALL display the user's nickname as the label and show the icon in `MAIN_COLOR`.

#### Scenario: Drawer item with no identity
- **WHEN** the drawer is opened and the user has no stored nickname
- **THEN** the Identity menu item SHALL display the label "Set Up Identity" and a red dot badge on the `user-secret` icon

#### Scenario: Drawer item with active identity
- **WHEN** the drawer is opened and the user has a stored nickname
- **THEN** the Identity menu item SHALL display the nickname as the label and the `user-secret` icon in `MAIN_COLOR` when the item is inactive

#### Scenario: Active screen highlighting preserved
- **WHEN** the identity screen is the active screen in the drawer
- **THEN** the drawer's default active highlighting (orange background, white icon/text) SHALL be applied normally

## REMOVED Requirements

### Requirement: Drawer identity badge
**Reason**: Redundant with the header icon and the enhanced Identity drawer menu item. Three paths to identity was excessive.
**Migration**: Identity status is now shown directly on the "Identity" drawer menu item.
