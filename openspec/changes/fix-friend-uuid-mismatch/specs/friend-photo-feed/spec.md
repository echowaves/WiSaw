## MODIFIED Requirements

### Requirement: Friend photo feed uses friend user UUID
The `FriendCard` component and friend detail navigation SHALL pass the friend's **user UUID** (derived from `uuid1`/`uuid2`) to `fetchFriendPhotos` and the `/friendships/[friendUuid]` route. The `friendshipUuid` SHALL be passed as a separate route parameter.

#### Scenario: FriendCard fetches photos with correct UUID
- **WHEN** a `FriendCard` renders and triggers `fetchFriendPhotos`
- **THEN** the `friendUuid` argument SHALL be the friend's user UUID (`uuid1` or `uuid2`, whichever is not the current user), not `friendshipUuid`

#### Scenario: Navigating to friend detail passes correct UUID
- **WHEN** the user taps a friend card in the friends list
- **THEN** the app SHALL navigate to `/friendships/{friendUserUuid}` with `friendshipUuid` and `friendName` as additional route params

#### Scenario: Friend detail screen receives correct UUIDs
- **WHEN** the friend detail screen loads
- **THEN** it SHALL receive the friend's user UUID as the path parameter `friendUuid` and the relationship ID as `friendshipUuid`
