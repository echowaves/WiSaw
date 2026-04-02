## Why

Both `feedForWave` and `feedForFriend` backend queries accept `sortBy` and `sortDirection` parameters, but neither the `WaveDetail` nor the new `FriendDetail` screen passes them. Users should be able to sort photo feeds within a wave or friend view (e.g., newest first, oldest first) via a kebab menu, consistent with how the waves list already supports sorting.

## What Changes

- Add sort state atoms for wave detail feed and friend detail feed sort preferences
- Pass `sortBy`/`sortDirection` parameters to `feedForWave` and `feedForFriend` GraphQL queries
- Add kebab menu sort options to the `WaveDetail` header (alongside existing Edit/Merge/Delete actions)
- Add kebab menu sort options to the `FriendDetail` header (alongside existing Edit Name/Remove Friend actions)
- Persist sort preferences via SecureStore (following the existing wave list sort pattern)
- Re-fetch photos when sort changes

## Capabilities

### New Capabilities

- `photo-feed-sort`: Sort controls for individual photo feeds (wave detail and friend detail) with persistence

### Modified Capabilities

- `wave-detail`: Add sort options to the wave detail kebab menu and pass sort params to `feedForWave` query
- `friend-photo-feed`: Add sort options to the friend detail kebab menu and pass sort params to `feedForFriend` query

## Impact

- **Code**: Modified `src/screens/WaveDetail/index.js`, `src/screens/WaveDetail/reducer.js`, `src/screens/FriendDetail/index.js`, `src/screens/FriendDetail/reducer.js`, route files for both screens
- **API**: Passes additional `sortBy`/`sortDirection` params to existing backend queries
- **State**: New jotai atoms for feed sort preferences, new SecureStore persistence
- **Sequencing**: Phase 3 of 4. Depends on Phase 1 (friend photo feed existing)
