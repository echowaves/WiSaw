## ADDED Requirements

### Requirement: Friend photo feed data fetching
The `fetchFriendPhotos` reducer function SHALL call the `feedForFriend` GraphQL query with `uuid`, `friendUuid`, `pageNumber`, and `batch` parameters. It SHALL return `{ photos, batch, noMoreData }` matching the `PhotoFeed` type. The query SHALL request the same photo fields as `feedForWave` (`id`, `uuid`, `imgUrl`, `thumbUrl`, `videoUrl`, `video`, `commentsCount`, `watchersCount`, `lastComment`, `createdAt`, `width`, `height`).

#### Scenario: Fetch first page of friend photos
- **WHEN** `fetchFriendPhotos` is called with `pageNumber: 0` and a batch UUID
- **THEN** it SHALL query `feedForFriend` with the provided parameters
- **THEN** it SHALL return the photos array, batch string, and noMoreData boolean

#### Scenario: Fetch returns no photos
- **WHEN** the friend has no shared photos
- **THEN** `fetchFriendPhotos` SHALL return `{ photos: [], batch, noMoreData: true }`

### Requirement: Friend detail screen renders photo feed
The `FriendDetail` screen SHALL accept `friendUuid` and `friendName` from route params via `useLocalSearchParams`. It SHALL fetch photos using `fetchFriendPhotos` with paginated loading. It SHALL render the photos using `PhotosListMasonry` with the expand/collapse pattern via `usePhotoExpansion`. It SHALL NOT include a camera footer or photo upload capabilities.

#### Scenario: Initial load
- **WHEN** the `FriendDetail` screen mounts with a `friendUuid`
- **THEN** it SHALL fetch page 0 with a new batch UUID
- **THEN** it SHALL render the returned photos in a masonry grid

#### Scenario: Pagination via scroll
- **WHEN** the user scrolls to the end of the photo list and `noMoreData` is false
- **THEN** it SHALL fetch the next page and append photos to the list

#### Scenario: Empty state
- **WHEN** the friend has no photos
- **THEN** the screen SHALL display an empty state message

#### Scenario: Pull to refresh
- **WHEN** the user triggers a refresh
- **THEN** the screen SHALL reset to page 0 with a new batch UUID and reload photos

### Requirement: Friend detail route and header
The friend detail screen SHALL be accessible at `app/friendships/[friendUuid].tsx`. The header SHALL display the friend's name as the title. The header SHALL include a back button and a kebab menu button on the right.

#### Scenario: Header displays friend name
- **WHEN** navigating to the friend detail with `friendName: "Alice"`
- **THEN** the header title SHALL display "Alice"

#### Scenario: Header fallback for missing name
- **WHEN** navigating without a `friendName` param
- **THEN** the header title SHALL display "Friend"

### Requirement: Friend detail kebab menu
The kebab menu on the friend detail screen SHALL expose friend-specific actions via `ActionMenu`: Edit Name and Remove Friend. Edit Name SHALL open a name picker. Remove Friend SHALL show a confirmation alert and call the appropriate deletion function.

#### Scenario: Edit friend name
- **WHEN** the user taps "Edit Name" in the kebab menu
- **THEN** a name picker SHALL appear allowing the user to change the friend's display name

#### Scenario: Remove friend
- **WHEN** the user taps "Remove Friend" in the kebab menu
- **THEN** a confirmation alert SHALL appear
- **WHEN** the user confirms removal
- **THEN** the friendship SHALL be deleted and the user SHALL be navigated back
