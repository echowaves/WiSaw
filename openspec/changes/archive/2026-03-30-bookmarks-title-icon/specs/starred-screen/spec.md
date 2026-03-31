## MODIFIED Requirements

### Requirement: Starred screen uses AppHeader
The Starred screen SHALL use the shared `AppHeader` component with a title that includes an Ionicons `bookmark` icon followed by the text "Bookmarks". The icon SHALL use `theme.TEXT_PRIMARY` as its color. The icon and text SHALL be rendered as a `React.ReactNode` passed to AppHeader's `title` prop. The header SHALL support the drawer back button for navigation. It SHALL NOT include segment controls.

#### Scenario: Starred screen header rendering
- **WHEN** the Starred screen is displayed
- **THEN** the header SHALL show an Ionicons `bookmark` icon (size 18) followed by the text "Bookmarks"
- **THEN** the icon color SHALL match `theme.TEXT_PRIMARY`
- **THEN** no segment control SHALL be present in the header

#### Scenario: Header icon layout
- **WHEN** the header title is rendered
- **THEN** the icon and text SHALL be horizontally aligned (flexDirection row, centered vertically)
- **THEN** the icon SHALL have a right margin separating it from the text
