## Requirements

### Requirement: Feed loader hook encapsulates feed lifecycle
The `useFeedLoader` hook SHALL manage the complete feed data lifecycle: fetching, pagination, abort control, photo list state, freeze/dedup, and event subscriptions. It SHALL accept a `fetchFn` parameter that encapsulates the data source query, making the hook source-agnostic.

#### Scenario: Hook accepts fetch function parameter
- **WHEN** a screen initializes `useFeedLoader` with a `fetchFn`
- **THEN** all data fetching SHALL use the provided `fetchFn`
- **THEN** the hook SHALL NOT contain any segment-specific branching

#### Scenario: Hook returns feed state and actions
- **WHEN** `useFeedLoader` is called
- **THEN** it SHALL return `photosList`, `loading`, `stopLoading`, `reload`, `handleLoadMore`, `setPhotosList`, and `removePhoto`

### Requirement: Feed loader manages photo list state
The hook SHALL maintain `photosList` in local state via `useState`. Photos SHALL be frozen via `createFrozenPhoto` at write boundaries. Duplicate photos (by `id`) SHALL be filtered when appending new pages.

#### Scenario: Fetched photos are frozen and deduplicated
- **WHEN** `load()` fetches a page of photos
- **THEN** each photo SHALL be passed through `createFrozenPhoto`
- **THEN** photos with IDs already present in `photosList` SHALL be excluded before appending

### Requirement: Feed loader manages pagination
The hook SHALL track `pageNumber`, `stopLoading`, and `consecutiveEmptyResponses`. The `handleLoadMore` function SHALL increment the page number and call `load()` explicitly. No `useEffect` watching `pageNumber` SHALL exist.

#### Scenario: Infinite scroll triggers next page
- **WHEN** the masonry grid reaches the scroll threshold and `stopLoading` is false
- **THEN** `handleLoadMore()` SHALL increment `pageNumber` and call `load()` with the new page
- **THEN** fetched photos SHALL be appended to the existing list

#### Scenario: Stop loading when no more data
- **WHEN** `load()` receives `noMoreData: true` from the fetch response
- **THEN** `stopLoading` SHALL be set to true
- **THEN** `handleLoadMore()` SHALL be a no-op

### Requirement: Feed loader manages abort control
The hook SHALL maintain an `AbortController` ref. Calling `reload()` SHALL abort any in-flight `load()` chain. All `setState` calls within async functions SHALL check `signal.aborted` before executing.

#### Scenario: Reload aborts in-flight load
- **WHEN** `reload()` is called while a previous `load()` is in progress
- **THEN** the previous AbortController SHALL be aborted
- **THEN** a new AbortController SHALL be created
- **THEN** state updates from the aborted chain SHALL be skipped

### Requirement: Feed loader empty response handling
The hook SHALL handle empty responses with the same branching logic as the current `PhotosList`: if `noMoreData` is true, stop. If search is active and `nextPage` exists, auto-page recursively. If no search, apply the consecutive-empty heuristic (stop on first empty if list is empty, or after 10 consecutive empties).

#### Scenario: Auto-page on empty search results
- **WHEN** `load()` returns empty photos with search active and `nextPage` provided
- **THEN** `load()` SHALL recursively call itself with `nextPage`
- **THEN** this SHALL continue until photos are found or `noMoreData` is true

### Requirement: Feed loader upload subscription is opt-in
The hook SHALL accept a `subscribeToUploads` parameter (default `false`). When `true`, it SHALL subscribe to the upload completion bus and prepend newly uploaded photos to `photosList`. When `false`, no upload subscription SHALL be created.

#### Scenario: Upload subscription enabled
- **WHEN** `useFeedLoader` is called with `subscribeToUploads: true`
- **THEN** it SHALL subscribe to the upload bus
- **WHEN** an upload completes
- **THEN** the uploaded photo SHALL be frozen and prepended to `photosList`

#### Scenario: Upload subscription disabled
- **WHEN** `useFeedLoader` is called with `subscribeToUploads: false` or default
- **THEN** no upload bus subscription SHALL be created

### Requirement: Feed loader subscribes to photo deletion
The hook SHALL always subscribe to the `photoDeletionBus` and remove matching photos from `photosList` when a deletion event is received.

#### Scenario: Photo deletion removes from list
- **WHEN** a `photoDeletionBus` event is emitted with a photo ID
- **THEN** the hook SHALL remove the matching photo from `photosList`

### Requirement: Feed loader provides removePhoto for context
The hook SHALL return a `removePhoto` function suitable for use in `PhotosListContext`, allowing child components to remove photos from the feed.

#### Scenario: Child component removes photo
- **WHEN** a child component calls `removePhoto(photoId)` via `PhotosListContext`
- **THEN** the hook SHALL filter the matching photo from `photosList`
