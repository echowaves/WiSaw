## MODIFIED Requirements

### Requirement: Popover menu on icon tap
The system SHALL display a popover dropdown using a native `Modal` overlay when the identity icon is tapped. The popover SHALL render above all screen content including the photo masonry grid. The popover SHALL show a single menu row with identity-appropriate content. Tapping the menu row SHALL navigate to `/(drawer)/identity`. Tapping outside the popover SHALL dismiss it without navigating.

#### Scenario: Popover with no identity
- **WHEN** the user taps the identity icon and has no stored nickname
- **THEN** a popover SHALL appear above all screen content showing a `user-plus` icon and the text "Set Up Identity"

#### Scenario: Popover with active identity
- **WHEN** the user taps the identity icon and has a stored nickname
- **THEN** a popover SHALL appear above all screen content showing a `user-secret` icon and the user's nickname

#### Scenario: Popover row navigation
- **WHEN** the user taps the menu row inside the popover
- **THEN** the system SHALL navigate to `/(drawer)/identity` and dismiss the popover

#### Scenario: Dismiss popover by tapping outside
- **WHEN** the user taps outside the popover while it is visible
- **THEN** the popover SHALL be dismissed without any navigation

#### Scenario: Popover renders above masonry content
- **WHEN** the popover is displayed
- **THEN** it SHALL be fully visible and not clipped or obscured by the photo masonry grid or any other screen content
