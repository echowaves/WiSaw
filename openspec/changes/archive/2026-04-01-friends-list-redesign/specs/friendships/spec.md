## MODIFIED Requirements

### Requirement: Friend List Display
The system SHALL display a list of all friends as visual cards. Pending friends SHALL be grouped in a `PendingFriendsCard` (displayed as `ListHeaderComponent`, only when pending friends exist). Confirmed friends SHALL be displayed as `FriendCard` components with photo strip previews, sorted by the active sort option. The list SHALL include a KeyboardStickyView search bar at the bottom, a LinearProgress loading bar during fetch, an InteractionHintBanner for interaction discovery, and a FriendsExplainerView when the list is empty.

#### Scenario: User views friend list with confirmed and pending friends
- **WHEN** the user navigates to the friends screen
- **THEN** a `PendingFriendsCard` SHALL appear at the top grouping all pending friends
- **THEN** confirmed friends SHALL appear below as `FriendCard` components with photo strip previews
- **THEN** confirmed friends SHALL be sorted by the active sort option
- **THEN** a search bar SHALL appear at the bottom of the screen

#### Scenario: User views friend list with no pending friends
- **WHEN** the user navigates to the friends screen and has no pending friends
- **THEN** the `PendingFriendsCard` SHALL NOT render
- **THEN** confirmed friends SHALL display as `FriendCard` components

#### Scenario: User views empty friend list
- **WHEN** the user navigates to the friends screen and has no friends
- **THEN** the system SHALL display FriendsExplainerView with educational content and an "Add a Friend" CTA
- **THEN** the search bar SHALL NOT be displayed

#### Scenario: User taps a confirmed friend
- **WHEN** the user taps a `FriendCard` (info row or photo thumbnail)
- **THEN** the app SHALL navigate to the friend photo feed at `/friendships/[friendUuid]` with the friend's name passed as a param
