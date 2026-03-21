## ADDED Requirements

### Requirement: CloseButton renders a circular close icon
The `CloseButton` component SHALL render a 40×40 circular TouchableOpacity with a centered Ionicons `close` icon at 24px.

#### Scenario: Default rendering
- **WHEN** `CloseButton` is rendered with an `onPress` handler
- **THEN** it displays a 40×40 circle with `rgba(0,0,0,0.6)` background, 1px `rgba(255,255,255,0.2)` border, and a white close icon with text shadow

### Requirement: CloseButton is positioned absolute top-right
The `CloseButton` SHALL default to `position: absolute`, `top: 10`, `right: 10` so it anchors to the top-right of its nearest positioned parent.

#### Scenario: Default positioning
- **WHEN** `CloseButton` is placed inside a relative-positioned container
- **THEN** it appears in the top-right corner at 10px from top and 10px from right

#### Scenario: Custom position via style prop
- **WHEN** `CloseButton` is rendered with `style={{ right: 20 }}`
- **THEN** the right offset is overridden to 20px while all other styles remain unchanged

### Requirement: CloseButton calls onPress when tapped
The `CloseButton` SHALL invoke the `onPress` callback when the user taps it.

#### Scenario: Tap triggers callback
- **WHEN** the user taps the close button
- **THEN** the `onPress` function is called exactly once

### Requirement: CloseButton has adequate hit area
The `CloseButton` SHALL include `hitSlop` of 10px on all sides to ensure tappability on all platforms.

#### Scenario: Tap near button edge
- **WHEN** the user taps within 10px outside the button boundary
- **THEN** the tap is registered and `onPress` is called

### Requirement: QuickActionsModal uses CloseButton
The `QuickActionsModal` SHALL replace its inline close button with the shared `CloseButton` component.

#### Scenario: Modal close button appearance
- **WHEN** the QuickActionsModal is visible
- **THEN** its close button matches the expanded photo view's close button exactly (40×40, white icon, dark background, border, shadow)

### Requirement: Expanded photo view uses CloseButton
The `Photo` component's `renderCloseButton` SHALL use the shared `CloseButton` component with `style={{ right: 20 }}` to maintain its current 20px right offset.

#### Scenario: Expanded photo close button appearance
- **WHEN** a photo is expanded in embedded mode
- **THEN** the close button renders identically to its current design using the shared component
