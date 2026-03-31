## MODIFIED Requirements

### Requirement: PhotosListHeader right-side icon row
The `PhotosListHeader` SHALL render the right side of the header as a horizontal flex row containing `FriendsHeaderIcon` and `WaveHeaderIcon` side by side, with an 8px gap between them. The row SHALL be absolutely positioned on the right side of the header. The left side SHALL continue to hold `IdentityHeaderIcon` unchanged.

#### Scenario: Header renders both right-side icons
- **WHEN** the `PhotosListHeader` component renders
- **THEN** the right side SHALL contain a `flexDirection: 'row'` View with `alignItems: 'center'` and `gap: 8`
- **THEN** `FriendsHeaderIcon` SHALL render first (leftmost in the row)
- **THEN** `WaveHeaderIcon` SHALL render second (rightmost in the row)
- **THEN** the container SHALL be absolutely positioned at `right: 16`

### Requirement: PhotosListFooter three-button layout
The `PhotosListFooter` SHALL render three buttons: drawer menu, video camera, and photo camera. The menu button SHALL be absolutely positioned on the left side of the footer (`left: 20`), removed from flex flow. The video and photo camera buttons SHALL be centered in the full footer width using `justifyContent: 'center'` with a `gap: 24` between them.

#### Scenario: Footer menu button is absolutely positioned
- **WHEN** the `PhotosListFooter` component renders
- **THEN** the menu button SHALL be positioned with `position: 'absolute'` and `left: 20`
- **THEN** the menu button SHALL NOT participate in the flex layout of the camera buttons

#### Scenario: Footer camera buttons are centered
- **WHEN** the `PhotosListFooter` component renders
- **THEN** the video and photo camera buttons SHALL be in a centered flex row
- **THEN** the row SHALL use `justifyContent: 'center'` and `gap: 24`
- **THEN** the buttons SHALL be visually centered in the full footer width regardless of the menu button

#### Scenario: Footer does not accept unreadCount prop
- **WHEN** `PhotosListFooter` is instantiated
- **THEN** it SHALL NOT accept an `unreadCount` prop
- **THEN** it SHALL NOT import or render the `Badge` component
