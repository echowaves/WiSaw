## MODIFIED Requirements

### Requirement: Wave Detail Pagination
The system SHALL paginate photos in Wave Detail, loading more as the user scrolls. When the user reaches the bottom of the loaded photos, `PhotosListMasonry` SHALL delegate to the parent screen's `onEndReached` callback to fetch the next page of wave photos via the `feedForWave` GraphQL query.

#### Scenario: User scrolls to the end of loaded photos
- **WHEN** the user scrolls to the end of loaded photos in the wave detail masonry grid
- **THEN** `PhotosListMasonry` calls the `onEndReached` prop provided by WaveDetail
- **THEN** WaveDetail's `handleLoadMore` increments the page number and calls `loadPhotos` with the next page and current batch
- **THEN** new photos are appended to the existing list

#### Scenario: All photos already loaded
- **WHEN** the user scrolls to the bottom and `noMoreData` is true
- **THEN** `handleLoadMore` does not fire a new fetch
- **THEN** the loading indicator is not shown

#### Scenario: Fetch is already in progress
- **WHEN** the user scrolls to the bottom while a fetch is in progress
- **THEN** `PhotosListMasonry` does not call `onEndReached` (guarded by `!loading && !stopLoading`)
- **THEN** no duplicate network request is made

#### Scenario: onEndReached prop not provided
- **WHEN** a parent screen does not pass an `onEndReached` prop to `PhotosListMasonry`
- **THEN** `PhotosListMasonry` falls back to calling `setPageNumber` directly (existing behavior for PhotosList)
