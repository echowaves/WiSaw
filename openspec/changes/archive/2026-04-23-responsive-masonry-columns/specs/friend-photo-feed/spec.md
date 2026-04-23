## MODIFIED Requirements

### Requirement: Friend detail screen renders photo feed
The `FriendDetail` screen SHALL accept `friendUuid` and `friendName` from route params via `useLocalSearchParams`. It SHALL fetch photos using `fetchFriendPhotos` with paginated loading, passing `sortBy` and `sortDirection` parameters to the `feedForFriend` query. It SHALL render the photos using `PhotosListMasonry` with the expand/collapse pattern via `usePhotoExpansion`, passing a comment-screen column profile (`{ 402: 2, 440: 3, 834: 5, 1024: 7, default: 9 }`) via the `columns` prop. When sort preferences change, the screen SHALL reset pagination to page 0 with a new batch and re-fetch photos. It SHALL NOT include a camera footer or photo upload capabilities. The screen SHALL render a `QuickActionsModalWrapper` and wire `handlePhotoLongPress` to open it, so that long-pressing a photo thumbnail or tapping the ⋮ pill opens the quick-actions modal with photo preview and action buttons — matching the main photo feed behavior.

#### Scenario: Initial load
- **WHEN** the `FriendDetail` screen mounts with a `friendUuid`
- **THEN** it SHALL fetch page 0 with a new batch UUID
- **THEN** it SHALL render the returned photos in a masonry grid

#### Scenario: FriendDetail uses comment-screen columns
- **WHEN** the FriendDetail screen renders `PhotosListMasonry`
- **THEN** it SHALL pass `columns={{ 402: 2, 440: 3, 834: 5, 1024: 7, default: 9 }}` to the masonry component
