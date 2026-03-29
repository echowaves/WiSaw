## ADDED Requirements

### Requirement: Identity icon in photo feed header
The system SHALL display an identity icon in the upper-left corner of the photo feed header. The icon SHALL use `user-secret` from FontAwesome5 and reflect the current identity state via color: `theme.TEXT_SECONDARY` when no identity is set, `MAIN_COLOR` (#EA5E3D) when an identity is active.

#### Scenario: Icon displayed with no identity
- **WHEN** the photo feed is displayed and the user has no stored nickname
- **THEN** the upper-left corner of the header SHALL display a `user-secret` icon in `theme.TEXT_SECONDARY` color

#### Scenario: Icon displayed with active identity
- **WHEN** the photo feed is displayed and the user has a stored nickname
- **THEN** the upper-left corner of the header SHALL display a `user-secret` icon in `MAIN_COLOR` color

### Requirement: Red dot badge for unset identity
The system SHALL display a red dot badge on the identity icon when no identity is set. The badge SHALL use `STATUS_ERROR` color and be positioned at the top-right corner of the icon. The badge SHALL NOT display when an identity is active.

#### Scenario: Badge visible when no identity
- **WHEN** the photo feed is displayed and the user has no stored nickname
- **THEN** a red dot badge (no number) SHALL be visible at the top-right corner of the identity icon

#### Scenario: Badge hidden when identity is active
- **WHEN** the photo feed is displayed and the user has a stored nickname
- **THEN** no badge SHALL be displayed on the identity icon

### Requirement: Popover menu on icon tap
The system SHALL display a small popover dropdown when the identity icon is tapped. The popover SHALL show a single menu row with identity-appropriate content. Tapping the menu row SHALL navigate to `/(drawer)/identity`. Tapping outside the popover SHALL dismiss it without navigating.

#### Scenario: Popover with no identity
- **WHEN** the user taps the identity icon and has no stored nickname
- **THEN** a popover SHALL appear showing a `user-plus` icon and the text "Set Up Identity"

#### Scenario: Popover with active identity
- **WHEN** the user taps the identity icon and has a stored nickname
- **THEN** a popover SHALL appear showing a `user-secret` icon and the user's nickname

#### Scenario: Popover row navigation
- **WHEN** the user taps the menu row inside the popover
- **THEN** the system SHALL navigate to `/(drawer)/identity` and dismiss the popover

#### Scenario: Dismiss popover by tapping outside
- **WHEN** the user taps outside the popover while it is visible
- **THEN** the popover SHALL be dismissed without any navigation
