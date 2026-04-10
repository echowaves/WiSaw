## ADDED Requirements

### Requirement: Bookmarks icon visible in header
The system SHALL display a bookmarks icon in the top navigation bar of the photos list screen, positioned to the left of the Friends and Waves icons.

#### Scenario: Header renders all three icons
- **WHEN** the photos list screen is displayed
- **THEN** the header SHALL show Bookmarks, Friends, and Waves icons in left-to-right order on the right side of the header

### Requirement: Bookmarks icon color reflects bookmark state
The bookmarks icon SHALL be colored `MAIN_COLOR` when the user has one or more bookmarks, and `TEXT_SECONDARY` (grey) when the user has zero bookmarks or the count is unknown.

#### Scenario: User has bookmarks
- **WHEN** `bookmarksCount` is greater than zero
- **THEN** the bookmarks icon SHALL be displayed in `MAIN_COLOR`

#### Scenario: User has no bookmarks
- **WHEN** `bookmarksCount` is zero or null
- **THEN** the bookmarks icon SHALL be displayed in `TEXT_SECONDARY` (grey)

### Requirement: Bookmarks icon navigates to bookmarks screen
The bookmarks icon SHALL navigate the user to the bookmarks screen when pressed.

#### Scenario: User taps bookmarks icon
- **WHEN** user presses the bookmarks header icon
- **THEN** the app SHALL navigate to the `bookmarks` screen

### Requirement: Bookmarks icon visual consistency
The bookmarks icon SHALL use the Ionicons `bookmark` icon at 22px size within a 40×40 touch target, matching the dimensions of the Friends and Waves header icons.

#### Scenario: Icon matches existing header icon dimensions
- **WHEN** the bookmarks header icon is rendered
- **THEN** it SHALL use a 40×40 TouchableOpacity container with a 22px Ionicons `bookmark` icon
