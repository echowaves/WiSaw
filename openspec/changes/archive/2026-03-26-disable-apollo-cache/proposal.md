## Why

The Apollo Client is configured with an `InMemoryCache` that no part of the app intentionally reads from. Some queries explicitly set `fetchPolicy: 'network-only'`, but 11+ queries omit it and silently default to `cache-first`, serving stale data. Additionally, `WaveCard` thumbnail `cacheKey` values are position-based rather than URL-based, so when photos change within a wave the old cached image persists on disk.

## What Changes

- Set `defaultOptions` on the `ApolloClient` instance to use `fetchPolicy: 'no-cache'` for all queries, watchQueries, and mutations — bypassing `InMemoryCache` entirely
- Remove all per-query `fetchPolicy: 'network-only'` overrides (now redundant)
- Adapt `WaveCard` to consume `Photo` objects from the updated `Wave.photos: [Photo]` schema, using `photo.thumbUrl` as image source, `cacheKey={${photo.id}-thumb}` (matching the `ImageView` pattern), and React `key={photo.id}` to force remount on photo changes

## Capabilities

### New Capabilities

_None_

### Modified Capabilities

- `wave-hub`: Update the "Waves List Focus Refresh" requirement to specify that `listWaves` requests `photos { id thumbUrl }` and `WaveCard` uses `photo.id`-based cacheKey/key matching the `ImageView` pattern

## Impact

- `src/consts.js` — add `defaultOptions` with `no-cache` to `ApolloClient` constructor
- `src/screens/Waves/reducer.js` — remove `fetchPolicy: 'network-only'` (×2)
- `src/screens/WaveDetail/reducer.js` — remove `fetchPolicy: 'network-only'` (×1)
- `src/screens/Chat/reducer.js` — remove `fetchPolicy: 'network-only'` (×1)
- `src/screens/FriendsList/friends_helper.js` — remove `fetchPolicy: 'network-only'` (×2)
- `src/screens/PhotoSelectionMode/index.js` — remove `fetchPolicy: 'network-only'` (×1)
- `src/components/Photo/reducer.js` — remove `fetchPolicy: 'network-only'` (×1)
- `src/screens/Waves/reducer.js` — update `listWaves` query to request `photos { id thumbUrl }`
- `src/components/WaveCard/index.js` — consume `Photo` objects with `photo.id`-based cacheKey and key
