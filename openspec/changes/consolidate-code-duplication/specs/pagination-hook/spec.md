## ADDED Requirements

### Requirement: useFeedLoader hook SHALL handle pagination for any photo listing screen

The system SHALL provide a `useFeedLoader()` hook in `src/hooks/useFeedLoader.js` that accepts a `fetchFn` parameter and manages all pagination state, loading states, and subscription handling. The hook SHALL be usable by PhotosList, BookmarksList, WaveDetail, and FriendDetail.

#### Scenario: Initial photo load
- **WHEN** a screen calls `useFeedLoader({ fetchFn: fetchWavePhotos, batch: 20 })`
- **THEN** the hook returns `photos`, `loading`, `pageNumber`, `noMoreData`, `handleRefresh`, and `handleLoadMore`

#### Scenario: Load more photos
- **WHEN** `handleLoadMore()` is called and `loading` is false and `noMoreData` is false
- **THEN** the hook appends new photos to the existing list and increments `pageNumber`

#### Scenario: Refresh resets list
- **WHEN** `handleRefresh()` is called
- **THEN** the hook replaces the entire photo list with fresh data and resets `pageNumber` to 1

#### Scenario: No more data stops pagination
- **WHEN** `fetchFn` returns `noMoreData: true`
- **THEN** `handleLoadMore()` becomes a no-op and `noMoreData` is set to true

#### Scenario: Loading guard prevents concurrent requests
- **WHEN** `handleLoadMore()` is called while `loading` is true
- **THEN** the hook returns immediately without making a new request

#### Scenario: Error handling via callback
- **WHEN** `fetchFn` rejects with an error
- **THEN** the hook sets `loading` to false and invokes an optional `onError` callback

### Requirement: WaveDetail SHALL adopt useFeedLoader

The system SHALL replace WaveDetail's manual `loadPhotos()` function, `handleRefresh()`, and `handleLoadMore()` with a single call to `useFeedLoader`.

#### Scenario: WaveDetail passes wave fetch function
- **WHEN** WaveDetail calls `useFeedLoader({ fetchFn: fetchWavePhotos, waveUuid, ... })`
- **THEN** WaveDetail's pagination behavior remains identical to before the migration

#### Scenario: WaveDetail passes photo transformer
- **WHEN** WaveDetail provides a `transformFn` option to `useFeedLoader`
- **THEN** each photo is wrapped with `createFrozenPhoto({ ...item, waveIsFrozen, waveViewerRole })`

### Requirement: FriendDetail SHALL adopt useFeedLoader

The system SHALL replace FriendDetail's manual `loadPhotos()` function, `handleRefresh()`, and `handleLoadMore()` with a single call to `useFeedLoader`.

#### Scenario: FriendDetail passes friend fetch function
- **WHEN** FriendDetail calls `useFeedLoader({ fetchFn: fetchFriendPhotos, friendUuid, ... })`
- **THEN** FriendDetail's pagination behavior remains identical to before the migration

#### Scenario: FriendDetail uses default photo transformer
- **WHEN** FriendDetail does not provide a `transformFn`
- **THEN** each photo is wrapped with `createFrozenPhoto(item)` (default behavior)
