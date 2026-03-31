## MODIFIED Requirements

### Requirement: Wave photo strip supports paginated loading
The strip SHALL initialize `pageNumber` to `-1` so that the first `handleLoadMore` invocation fetches page 0 through `fetchFn`, establishing proper server-side batch state. `fetchFn(pageNumber, batch)` SHALL be called when `onEndReached` fires during horizontal scrolling. Fetched photos SHALL be deduplicated against existing photos by `id` (using a `Set`) before appending. When `noMoreData` is true, no further fetches SHALL occur. A small loading indicator SHALL appear at the trailing end while loading.

#### Scenario: First onEndReached fetches page 0
- **WHEN** the strip's first `onEndReached` fires (pageNumber is -1)
- **THEN** `fetchFn` SHALL be called with `pageNumber: 0` and the component's `batch` UUID
- **THEN** returned photos SHALL be deduplicated against `initialPhotos` by photo `id` and only new photos SHALL be appended

#### Scenario: Subsequent scroll triggers next page
- **WHEN** the user scrolls the strip to the end after page 0 has loaded and `noMoreData` is false
- **THEN** `fetchFn` SHALL be called with the next incrementing `pageNumber` (1, 2, ...)
- **THEN** returned photos SHALL be deduplicated and appended

#### Scenario: No more data stops fetching
- **WHEN** `fetchFn` returns `noMoreData: true`
- **THEN** subsequent `onEndReached` events SHALL NOT trigger further fetches

#### Scenario: Loading indicator during fetch
- **WHEN** a page fetch is in progress
- **THEN** a small `ActivityIndicator` SHALL appear as the `ListFooterComponent` of the horizontal FlatList

## ADDED Requirements

### Requirement: Wave photo strip supports photo long press
The `WavePhotoStrip` component SHALL accept an optional `onPhotoLongPress` callback prop. When provided, each thumbnail SHALL be wrapped in a `Pressable` with `onLongPress` that calls `onPhotoLongPress(item)` where `item` is the photo object. When `onPhotoLongPress` is not provided, thumbnails SHALL render without a `Pressable` wrapper (current behavior for contexts that don't need it).

#### Scenario: Long press on thumbnail with handler
- **WHEN** `onPhotoLongPress` is provided and the user long-presses a thumbnail
- **THEN** `onPhotoLongPress` SHALL be called with the photo object

#### Scenario: No handler means no Pressable wrapper
- **WHEN** `onPhotoLongPress` is not provided
- **THEN** thumbnails SHALL render as plain `CachedImage` elements without `Pressable` wrapping
