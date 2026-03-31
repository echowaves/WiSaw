## Requirements

### Requirement: Screen header icon map
The system SHALL maintain a `SCREEN_HEADER_ICONS` constant map that defines, for each primary drawer screen (identity, friends, waves, feedback), the icon library component, icon name, and display title string.

#### Scenario: Map contains all four screens
- **WHEN** `SCREEN_HEADER_ICONS` is accessed
- **THEN** it SHALL contain entries for keys `identity`, `friends`, `waves`, and `feedback`, each with `library`, `name`, and `title` properties

#### Scenario: Icon definitions match drawer icons
- **WHEN** a screen's icon is rendered in both the drawer and the header
- **THEN** the icon library and icon name SHALL be identical (sourced from `SCREEN_HEADER_ICONS`)

### Requirement: Screen icon title component
The system SHALL provide a `ScreenIconTitle` component that renders an icon followed by the screen title text inline, for use as the `title` prop in `AppHeader`.

#### Scenario: Rendering a standard screen header
- **WHEN** `ScreenIconTitle` is rendered with `screenKey` set to `friends`, `waves`, or `feedback`
- **THEN** it SHALL display the corresponding icon from `SCREEN_HEADER_ICONS` at size 18 in `theme.TEXT_PRIMARY` color, followed by the title text styled to match `AppHeader`'s title text style

#### Scenario: Icon and title layout
- **WHEN** `ScreenIconTitle` is rendered
- **THEN** the icon and title text SHALL be laid out horizontally (flexDirection row) with center vertical alignment and a small gap between them

### Requirement: Identity header icon styling
The `ScreenIconTitle` component SHALL apply Identity-aware styling when `screenKey` is `identity`.

#### Scenario: Identity is set
- **WHEN** `ScreenIconTitle` is rendered with `screenKey='identity'` and the user has a nickName set (non-empty string)
- **THEN** the icon color SHALL be `MAIN_COLOR`

#### Scenario: Identity is not set
- **WHEN** `ScreenIconTitle` is rendered with `screenKey='identity'` and the user has no nickName (empty string)
- **THEN** the icon color SHALL be `theme.TEXT_PRIMARY` and a red badge dot (8×8, `#FF3B30`) SHALL be displayed at the top-right of the icon

### Requirement: Primary drawer screens use icon titles
Each of the four primary drawer screens (Identity, Friends, Waves, Feedback) SHALL pass a `ScreenIconTitle` component as the `title` prop to their `AppHeader` instead of a plain string.

#### Scenario: Identity screen header
- **WHEN** the Identity screen is displayed
- **THEN** the header SHALL show the user-secret icon followed by "Identity"

#### Scenario: Friends screen header
- **WHEN** the Friends screen is displayed
- **THEN** the header SHALL show the user-friends icon followed by "Friends"

#### Scenario: Waves screen header
- **WHEN** the Waves screen is displayed
- **THEN** the header SHALL show the water icon followed by "Waves"

#### Scenario: Feedback screen header
- **WHEN** the Feedback screen is displayed
- **THEN** the header SHALL show the feedback icon followed by "Feedback"
