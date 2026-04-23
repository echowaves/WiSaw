## MODIFIED Requirements

### Requirement: Starred screen displays watched photos feed
The Starred screen SHALL display the user's watched/starred photos using the `feedForWatcher` GraphQL query. It SHALL use `useFeedLoader` with `requestWatchedPhotos` as the fetch function. It SHALL NOT require GPS location. It SHALL use the starred-specific layout config (larger tiles, square aspect ratios) and pass a comment-screen column profile (`{ 402: 2, 440: 3, 834: 5, 1024: 7, default: 9 }`) to `PhotosListMasonry` via the `columns` prop.

#### Scenario: Starred screen loads watched photos
- **WHEN** the user navigates to the Starred screen
- **THEN** the screen SHALL call `requestWatchedPhotos` with the user's `uuid`, `pageNumber`, `batch`, and optional `searchTerm`
- **THEN** photos SHALL be displayed in a masonry grid with the starred layout config

#### Scenario: Starred screen works without location
- **WHEN** the user opens the Starred screen and location is pending or denied
- **THEN** the feed SHALL load normally using only `uuid`
- **THEN** no location-related empty states or banners SHALL be shown

#### Scenario: Starred screen uses comment-screen columns
- **WHEN** the BookmarksList screen renders `PhotosListMasonry`
- **THEN** it SHALL pass `columns={{ 402: 2, 440: 3, 834: 5, 1024: 7, default: 9 }}` to the masonry component
