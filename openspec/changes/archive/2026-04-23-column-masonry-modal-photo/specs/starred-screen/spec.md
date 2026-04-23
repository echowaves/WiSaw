## MODIFIED Requirements

### Requirement: Starred screen displays watched photos feed
The Starred screen SHALL display the user's watched/starred photos using the `feedForWatcher` GraphQL query. It SHALL use `useFeedLoader` with `requestWatchedPhotos` as the fetch function. It SHALL NOT require GPS location. It SHALL use column-based masonry layout (`layoutMode='column'`, `columns={2}`) with the starred-specific layout config (larger tiles, square aspect ratios). Thumbnails SHALL display comment sections below the image for photos with comment data, using `getExtraHeight` to allocate space. When the user taps a photo thumbnail, the app SHALL navigate to the `/photo-detail` modal instead of expanding inline.

#### Scenario: Starred screen loads watched photos
- **WHEN** the user navigates to the Starred screen
- **THEN** the screen SHALL call `requestWatchedPhotos` with the user's `uuid`, `pageNumber`, `batch`, and optional `searchTerm`
- **THEN** photos SHALL be displayed in a column-based masonry grid with comment sections below thumbnails

#### Scenario: User taps a photo in starred screen
- **WHEN** the user taps a photo thumbnail in the bookmarks masonry grid
- **THEN** the app SHALL set `photoDetailAtom` with the photo and `removePhoto` callback
- **THEN** the app SHALL navigate to `/photo-detail` modal
- **THEN** no inline expansion SHALL occur

#### Scenario: Starred screen works without location
- **WHEN** the user opens the Starred screen and location is pending or denied
- **THEN** the feed SHALL load normally using only `uuid`
- **THEN** no location-related empty states or banners SHALL be shown

#### Scenario: Comment sections visible on starred thumbnails
- **WHEN** a bookmarked photo has comments, watchers, or a last comment
- **THEN** a 44px comment section SHALL appear below the thumbnail image
- **THEN** the section SHALL show last comment text and stat icons
