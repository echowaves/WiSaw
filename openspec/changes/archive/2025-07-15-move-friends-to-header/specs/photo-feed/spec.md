## ADDED Requirements

### Requirement: PhotosListHeader right-side icon row
The `PhotosListHeader` SHALL render the right side of the header as a horizontal flex row containing `WaveHeaderIcon` and `FriendsHeaderIcon` side by side, with an 8px gap between them. The row SHALL be absolutely positioned on the right side of the header. The left side SHALL continue to hold `IdentityHeaderIcon` unchanged.

#### Scenario: Header renders both right-side icons
- **WHEN** the `PhotosListHeader` component renders
- **THEN** the right side SHALL contain a `flexDirection: 'row'` View with `alignItems: 'center'` and `gap: 8`
- **THEN** `WaveHeaderIcon` SHALL render first (leftmost in the row)
- **THEN** `FriendsHeaderIcon` SHALL render second (rightmost in the row)
- **THEN** the container SHALL be absolutely positioned at `right: 16`

### Requirement: PhotosListFooter three-button layout
The `PhotosListFooter` SHALL render exactly three buttons: drawer menu, video camera, and photo camera. The Friends button SHALL NOT be present. The footer SHALL NOT receive or use an `unreadCount` prop. The `space-around` layout SHALL naturally center the three remaining buttons.

#### Scenario: Footer renders without Friends button
- **WHEN** the `PhotosListFooter` component renders
- **THEN** it SHALL display three buttons: drawer menu (navicon), video camera, and photo camera
- **THEN** no Friends icon or badge SHALL be present
- **THEN** the buttons SHALL be evenly distributed via `justifyContent: 'space-around'`

#### Scenario: Footer does not accept unreadCount prop
- **WHEN** `PhotosListFooter` is instantiated
- **THEN** it SHALL NOT accept an `unreadCount` prop
- **THEN** it SHALL NOT import or render the `Badge` component
