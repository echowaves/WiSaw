## MODIFIED Requirements

### Requirement: Identity status in drawer menu item
The drawer's "Identity" menu item SHALL reflect the current identity state. When no identity is set, the item SHALL display the label "Set Up Identity" and show a red dot badge on the icon. When an identity is active, the item SHALL display the user's nickname as the label and show the icon in `MAIN_COLOR`. The label SHALL NOT truncate with ellipsis — long nicknames SHALL wrap to multiple lines.

#### Scenario: Drawer item with no identity
- **WHEN** the drawer is opened and the user has no stored nickname
- **THEN** the Identity menu item SHALL display the label "Set Up Identity" and a red dot badge on the `user-secret` icon

#### Scenario: Drawer item with active identity
- **WHEN** the drawer is opened and the user has a stored nickname
- **THEN** the Identity menu item SHALL display the nickname as the label and the `user-secret` icon in `MAIN_COLOR` when the item is inactive

#### Scenario: Drawer label does not truncate
- **WHEN** the drawer is opened and the user has a long nickname
- **THEN** the Identity menu item label SHALL wrap to additional lines rather than truncating with ellipsis

### Requirement: Header identity icon popover label
The `IdentityHeaderIcon` popover SHALL display the full label text without truncation. The popover SHALL be wide enough to accommodate "Set Up Identity" and reasonable nickname lengths on a single line.

#### Scenario: Popover displays full label when no identity
- **WHEN** the user taps the identity icon in the header and has no stored nickname
- **THEN** the popover SHALL display "Set Up Identity" in full without ellipsis truncation

#### Scenario: Popover displays full nickname
- **WHEN** the user taps the identity icon in the header and has a stored nickname
- **THEN** the popover SHALL display the full nickname without ellipsis truncation

#### Scenario: Popover wraps for long text
- **WHEN** the popover label text exceeds the available width
- **THEN** the label SHALL wrap to additional lines rather than truncating with ellipsis
