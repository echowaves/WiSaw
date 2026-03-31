## Requirements

### Requirement: Wave photo strip renders horizontal scrollable thumbnails
The `WavePhotoStrip` component SHALL render a horizontal `FlatList` of photo thumbnails. Each thumbnail SHALL be a square `CachedImage` (80x80). The strip SHALL have a fixed height. The component SHALL accept `initialPhotos` (array of photos to display immediately), `fetchFn` (async function accepting `(pageNumber, batch)` returning `PhotoFeed`), and `theme`. The component SHALL use a `useEffect` to sync internal photo state when the `initialPhotos` prop updates asynchronously (e.g., when the parent fetches data after mount).

#### Scenario: Render initial photos
- **WHEN** `WavePhotoStrip` mounts with `initialPhotos` containing 4 photos
- **THEN** 4 square thumbnails SHALL be rendered in a horizontal row
- **THEN** no fetch call SHALL be made until the user scrolls

#### Scenario: Initial photos update after mount
- **WHEN** the parent component fetches photos asynchronously and updates `initialPhotos` from `[]` to a populated array
- **THEN** `WavePhotoStrip` SHALL update its internal state to display the new photos via a `useEffect` watching `initialPhotos`

#### Scenario: Empty initial photos shows placeholder
- **WHEN** `WavePhotoStrip` mounts with empty `initialPhotos` and no `fetchFn`
- **THEN** a placeholder icon SHALL be displayed (FontAwesome5 `water` icon)

### Requirement: Wave photo strip supports paginated loading
The strip SHALL call `fetchFn(pageNumber, batch)` when `onEndReached` fires during horizontal scrolling. Fetched photos SHALL be appended to the existing list. When `noMoreData` is true, no further fetches SHALL occur. A small loading indicator SHALL appear at the trailing end while loading.

#### Scenario: Horizontal scroll triggers next page
- **WHEN** the user scrolls the strip to the end and `noMoreData` is false
- **THEN** `fetchFn` SHALL be called with the next `pageNumber`
- **THEN** returned photos SHALL be appended to the strip

#### Scenario: No more data stops fetching
- **WHEN** `fetchFn` returns `noMoreData: true`
- **THEN** subsequent `onEndReached` events SHALL NOT trigger further fetches

#### Scenario: Loading indicator during fetch
- **WHEN** a page fetch is in progress
- **THEN** a small `ActivityIndicator` SHALL appear as the `ListFooterComponent` of the horizontal FlatList
