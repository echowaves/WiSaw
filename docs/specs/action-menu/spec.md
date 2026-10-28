## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for action menu in WiSaw.

## Requirements

### Requirement: ActionMenu Component
The system SHALL provide a reusable `ActionMenu` component at `src/components/ActionMenu/index.js` that renders a themed center-card modal with a list of icon + label menu items. The card SHALL include a close button in the upper-right corner of the header.

#### Scenario: ActionMenu renders when visible
- **WHEN** `visible` prop is `true`
- **THEN** a `Modal` with `transparent` background and `fade` animation SHALL be displayed
- **THEN** a semi-transparent overlay (`rgba(0, 0, 0, 0.6)`) SHALL cover the full screen
- **THEN** a centered card SHALL be rendered with `theme.SURFACE` background, `borderRadius: 16`, `width: '85%'`, `maxWidth: 360`

#### Scenario: ActionMenu is hidden
- **WHEN** `visible` prop is `false`
- **THEN** the Modal SHALL not be rendered

#### Scenario: Close button renders in upper-right corner
- **WHEN** the ActionMenu is visible
- **THEN** a close button SHALL be rendered at the top of the card, aligned to the right edge
- **THEN** the close button SHALL use an Ionicons `close` icon, size 24, color `theme.TEXT_PRIMARY`
- **THEN** the close button SHALL have `hitSlop: { top: 10, bottom: 10, left: 10, right: 10 }` for touch area

#### Scenario: Close button with title
- **WHEN** the `title` prop is provided
- **THEN** a header row SHALL render with the title on the left and the close button on the right
- **THEN** the header row SHALL use `flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'center'`

#### Scenario: Close button without title
- **WHEN** the `title` prop is not provided
- **THEN** a header row SHALL still render with the close button aligned to the right
- **THEN** the header row SHALL use `justifyContent: 'flex-end'`

#### Scenario: Close button dismisses menu
- **WHEN** the user taps the close button
- **THEN** `onClose` SHALL be called

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
The `ActionMenu` SHALL dismiss when the user taps the overlay, taps the close button, or selects a menu item.

#### Scenario: User taps overlay
- **WHEN** the user taps outside the card (on the overlay area)
- **THEN** `onClose` SHALL be called and the modal SHALL dismiss

#### Scenario: User taps close button
- **WHEN** the user taps the close button in the header
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
