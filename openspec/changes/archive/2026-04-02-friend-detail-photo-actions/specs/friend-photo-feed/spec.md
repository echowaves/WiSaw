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
