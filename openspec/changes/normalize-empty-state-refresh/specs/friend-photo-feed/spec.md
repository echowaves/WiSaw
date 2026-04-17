## MODIFIED Requirements

### Requirement: Friend detail screen renders photo feed
The `FriendDetail` screen SHALL accept `friendUuid` and `friendName` from route params via `useLocalSearchParams`. It SHALL fetch photos using `fetchFriendPhotos` with paginated loading, passing `sortBy` and `sortDirection` parameters to the `feedForFriend` query. It SHALL render the photos using `PhotosListMasonry` with the expand/collapse pattern via `usePhotoExpansion`. When sort preferences change, the screen SHALL reset pagination to page 0 with a new batch and re-fetch photos. It SHALL NOT include a camera footer or photo upload capabilities. The screen SHALL render a `QuickActionsModalWrapper` and wire `handlePhotoLongPress` to open it, so that long-pressing a photo thumbnail or tapping the ⋮ pill opens the quick-actions modal with photo preview and action buttons — matching the main photo feed behavior.

#### Scenario: Initial load
- **WHEN** the `FriendDetail` screen mounts with a `friendUuid`
- **THEN** it SHALL fetch page 0 with a new batch UUID
- **THEN** it SHALL render the returned photos in a masonry grid

#### Scenario: Pagination via scroll
- **WHEN** the user scrolls to the end of the photo list and `noMoreData` is false
- **THEN** it SHALL fetch the next page and append photos to the list

#### Scenario: Empty state with refresh
- **WHEN** the friend has no photos
- **THEN** the screen SHALL display an empty state card
- **THEN** the empty state SHALL be wrapped in a `ScrollView` with a `RefreshControl` wired to `handleRefresh()`
- **THEN** the empty state card SHALL include a "Refresh" action button that calls `handleRefresh()`

#### Scenario: Pull to refresh
- **WHEN** the user triggers a refresh (pull gesture or button tap)
- **THEN** the screen SHALL reset to page 0 with a new batch UUID and reload photos
