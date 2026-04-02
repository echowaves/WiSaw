## MODIFIED Requirements

### Requirement: Friend detail screen renders photo feed
The `FriendDetail` screen SHALL accept `friendUuid` and `friendName` from route params via `useLocalSearchParams`. It SHALL fetch photos using `fetchFriendPhotos` with paginated loading, passing `sortBy` and `sortDirection` parameters to the `feedForFriend` query. It SHALL render the photos using `PhotosListMasonry` with the expand/collapse pattern via `usePhotoExpansion`. When sort preferences change, the screen SHALL reset pagination to page 0 with a new batch and re-fetch photos. It SHALL NOT include a camera footer or photo upload capabilities.

#### Scenario: Sort params passed to feedForFriend
- **WHEN** the friend detail screen fetches photos
- **THEN** `fetchFriendPhotos` SHALL pass the current `sortBy` and `sortDirection` to the `feedForFriend` query

#### Scenario: Sort change triggers re-fetch
- **WHEN** the user changes the sort option in the friend detail kebab menu
- **THEN** the photo list SHALL reset to page 0 with a new batch UUID
- **THEN** photos SHALL be re-fetched with the updated sort parameters
