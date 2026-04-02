# Friend Photo Feed Specification

## Purpose
Enables viewing a friend's shared photos in a dedicated photo feed screen, accessed from the friends list.

## Requirements

**Requirement: Friend photo feed data fetching**
The `fetchFriendPhotos` reducer function SHALL call the `feedForFriend` GraphQL query with `uuid`, `friendUuid`, `pageNumber`, and `batch` parameters. It SHALL return `{ photos, batch, noMoreData }` matching the `PhotoFeed` type. The query SHALL request the same photo fields as `feedForWave` (`id`, `uuid`, `imgUrl`, `thumbUrl`, `videoUrl`, `video`, `commentsCount`, `watchersCount`, `lastComment`, `createdAt`, `width`, `height`).

#### Scenario: Fetch first page of friend photos
- **WHEN** `fetchFriendPhotos` is called with `pageNumber: 0` and a batch UUID
- **THEN** it SHALL query `feedForFriend` with the provided parameters
- **THEN** it SHALL return the photos array, batch string, and noMoreData boolean

#### Scenario: Fetch returns no photos
- **WHEN** the friend has no shared photos
- **THEN** `fetchFriendPhotos` SHALL return `{ photos: [], batch, noMoreData: true }`

**Requirement: Friend detail screen renders photo feed**
The `FriendDetail` screen SHALL accept `friendUuid` and `friendName` from route params via `useLocalSearchParams`. It SHALL fetch photos using `fetchFriendPhotos` with paginated loading, passing `sortBy` and `sortDirection` parameters to the `feedForFriend` query. It SHALL render the photos using `PhotosListMasonry` with the expand/collapse pattern via `usePhotoExpansion`. When sort preferences change, the screen SHALL reset pagination to page 0 with a new batch and re-fetch photos. It SHALL NOT include a camera footer or photo upload capabilities. The screen SHALL render a `QuickActionsModalWrapper` and wire `handlePhotoLongPress` to open it, so that long-pressing a photo thumbnail or tapping the ⋮ pill opens the quick-actions modal with photo preview and action buttons — matching the main photo feed behavior.

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

#### Scenario: Sort params passed to feedForFriend
- **WHEN** the friend detail screen fetches photos
- **THEN** `fetchFriendPhotos` SHALL pass the current `sortBy` and `sortDirection` to the `feedForFriend` query

#### Scenario: Sort change triggers re-fetch
- **WHEN** the user changes the sort option in the friend detail kebab menu
- **THEN** the photo list SHALL reset to page 0 with a new batch UUID
- **THEN** photos SHALL be re-fetched with the updated sort parameters

#### Scenario: Long-press opens quick-actions modal
- **WHEN** the user long-presses a photo thumbnail in the friend photo feed
- **THEN** haptic feedback SHALL be triggered
- **THEN** the `QuickActionsModal` SHALL open with the photo preview and action buttons

#### Scenario: Kebab pill tap opens quick-actions modal
- **WHEN** the user taps the ⋮ pill on a photo thumbnail in the friend photo feed
- **THEN** haptic feedback SHALL be triggered
- **THEN** the `QuickActionsModal` SHALL open with the same behavior as long-press

#### Scenario: Photo deleted via quick-actions modal
- **WHEN** a photo is deleted through the quick-actions modal in the friend feed
- **THEN** the photo SHALL be removed from the local photo list without a full re-fetch

**Requirement: Friend detail route and header**
The friend detail screen SHALL be accessible at `app/friendships/[friendUuid].tsx`. The header SHALL display the friend's name as the title. The header SHALL include a back button and a kebab menu button on the right.

#### Scenario: Header displays friend name
- **WHEN** navigating to the friend detail with `friendName: "Alice"`
- **THEN** the header title SHALL display "Alice"

#### Scenario: Header fallback for missing name
- **WHEN** navigating without a `friendName` param
- **THEN** the header title SHALL display "Friend"

**Requirement: Friend detail kebab menu**
The kebab menu on the friend detail screen SHALL expose friend-specific actions via `ActionMenu`: Edit Name and Remove Friend. Edit Name SHALL open a name picker. Remove Friend SHALL show a confirmation alert and call the appropriate deletion function.

#### Scenario: Edit friend name
- **WHEN** the user taps "Edit Name" in the kebab menu
- **THEN** a name picker SHALL appear allowing the user to change the friend's display name

#### Scenario: Remove friend
- **WHEN** the user taps "Remove Friend" in the kebab menu
- **THEN** a confirmation alert SHALL appear
- **WHEN** the user confirms removal
- **THEN** the friendship SHALL be deleted and the user SHALL be navigated back

**Requirement: Friend photo feed uses friend user UUID**
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
