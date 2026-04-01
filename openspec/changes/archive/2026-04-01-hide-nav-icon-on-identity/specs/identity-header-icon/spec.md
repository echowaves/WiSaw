## MODIFIED Requirements

### Requirement: Identity status in drawer menu item
The drawer's "Identity" menu item SHALL reflect the current identity state. When no identity is set, the item SHALL display the label "Set Up Identity" and show a red dot badge on the icon. When an identity is active, the item SHALL display the user's nickname as the label and show the icon in `MAIN_COLOR`. No functional changes — the header layout context changes (the right side now holds two icons: Waves and Friends) but the identity icon behavior is unchanged.

#### Scenario: Drawer item with no identity
- **WHEN** the drawer is opened and the user has no stored nickname
- **THEN** the Identity menu item SHALL display the label "Set Up Identity" and a red dot badge on the `user-secret` icon

#### Scenario: Drawer item with active identity
- **WHEN** the drawer is opened and the user has a stored nickname
- **THEN** the Identity menu item SHALL display the nickname as the label and the `user-secret` icon in `MAIN_COLOR` when the item is inactive

#### Scenario: Header identity icon hidden when identity is established
- **WHEN** the PhotosList header is rendered and the user has a stored nickname (identity established)
- **THEN** the `IdentityHeaderIcon` SHALL NOT render any visible content
- **THEN** the header layout SHALL remain unchanged (no shift or reflow of other elements)

#### Scenario: Header identity icon shown when no identity
- **WHEN** the PhotosList header is rendered and the user has no stored nickname
- **THEN** the `IdentityHeaderIcon` SHALL render in the left position of the header
- **THEN** the dropdown/popover behavior SHALL function as before
