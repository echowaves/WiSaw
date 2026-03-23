## ADDED Requirements

### Requirement: ActionMenu Component
The system SHALL provide a reusable `ActionMenu` component at `src/components/ActionMenu/index.js` that renders a themed center-card modal with a list of icon + label menu items.

#### Scenario: ActionMenu renders when visible
- **WHEN** `visible` prop is `true`
- **THEN** a `Modal` with `transparent` background and `fade` animation SHALL be displayed
- **THEN** a semi-transparent overlay (`rgba(0, 0, 0, 0.6)`) SHALL cover the full screen
- **THEN** a centered card SHALL be rendered with `theme.SURFACE` background, `borderRadius: 16`, `width: '85%'`, `maxWidth: 360`

#### Scenario: ActionMenu is hidden
- **WHEN** `visible` prop is `false`
- **THEN** the Modal SHALL not be rendered

#### Scenario: Optional title is displayed
- **WHEN** the `title` prop is provided
- **THEN** a centered title text SHALL appear at the top of the card using `theme.TEXT_SECONDARY`, `fontSize: 14`

### Requirement: ActionMenu Item Types
The `ActionMenu` SHALL support the following item types via the `items` array prop.

#### Scenario: Regular item renders icon and label
- **WHEN** an item object with `key`, `icon`, `label`, and `onPress` is provided
- **THEN** the row SHALL display a `MaterialCommunityIcons` icon (size 22, `theme.TEXT_PRIMARY`) on the left and the label text (`fontSize: 16`, `theme.TEXT_PRIMARY`) on the right
- **THEN** tapping the row SHALL call `onClose` then `item.onPress`

#### Scenario: Checked item displays checkmark
- **WHEN** an item has `checked: true`
- **THEN** a `check` icon from `MaterialCommunityIcons` SHALL be displayed on the trailing edge of the row using `CONST.MAIN_COLOR`

#### Scenario: Destructive item renders in red
- **WHEN** an item has `destructive: true`
- **THEN** the icon and label SHALL be rendered in `#FF3B30` instead of `theme.TEXT_PRIMARY`

#### Scenario: Disabled item is non-interactive
- **WHEN** an item has `disabled: true`
- **THEN** the row SHALL render at reduced opacity (0.4) and SHALL NOT respond to taps

#### Scenario: Separator renders divider line
- **WHEN** the string `'separator'` appears in the items array
- **THEN** a 1px horizontal line SHALL be rendered using `theme.INTERACTIVE_BORDER`

### Requirement: ActionMenu Dismiss Behavior
The `ActionMenu` SHALL dismiss when the user taps the overlay or selects a menu item.

#### Scenario: User taps overlay
- **WHEN** the user taps outside the card (on the overlay area)
- **THEN** `onClose` SHALL be called and the modal SHALL dismiss

#### Scenario: User taps a menu item
- **WHEN** the user taps an enabled menu item
- **THEN** `onClose` SHALL be called first
- **THEN** `item.onPress` SHALL be called (if provided)

### Requirement: ActionMenu Theme Support
The `ActionMenu` SHALL support light and dark mode using the reactive theme system.

#### Scenario: ActionMenu in dark mode
- **WHEN** `isDarkMode` is true
- **THEN** the card SHALL use `theme.SURFACE` from the dark theme
- **THEN** text SHALL use `theme.TEXT_PRIMARY` from the dark theme
- **THEN** separators SHALL use `theme.INTERACTIVE_BORDER` from the dark theme
