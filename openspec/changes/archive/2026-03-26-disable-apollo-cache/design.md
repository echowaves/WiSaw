## Context

The app uses Apollo Client 4.0.2 with an `InMemoryCache`. No part of the application intentionally reads from the cache — every data fetch is meant to go to the server. However, only 8 of 19+ queries explicitly set `fetchPolicy: 'network-only'`, leaving 11+ queries on the default `cache-first` which silently serves stale data. Additionally, `network-only` still writes to the cache (wasting memory), and `WaveCard` uses position-based `cacheKey` values for `expo-cached-image`, causing thumbnails to remain stale on disk when wave photos change.

## Goals / Non-Goals

**Goals:**
- Ensure all GraphQL queries bypass Apollo's InMemoryCache by default
- Remove per-query `fetchPolicy` boilerplate
- Fix wave card thumbnail disk cache staleness

**Non-Goals:**
- Removing `InMemoryCache` from `ApolloClient` constructor (Apollo requires it)
- Changing backend API behavior
- Introducing a different caching strategy

## Decisions

### 1. Set `defaultOptions` with `fetchPolicy: 'no-cache'` on ApolloClient

Configure `defaultOptions` in the `ApolloClient` constructor in `src/consts.js` to set `fetchPolicy: 'no-cache'` for `query`, `watchQuery`, and `mutate`. This makes `no-cache` the app-wide default, so no individual query needs to specify it.

**Why `no-cache` over `network-only`?** `network-only` always hits the server but still writes the response to `InMemoryCache`. Since nothing reads from cache, those writes are wasted work and memory. `no-cache` skips cache reads AND writes.

**Why not remove `InMemoryCache`?** Apollo Client requires a cache instance. Passing `new InMemoryCache()` is the minimum. With `no-cache` as default, it's never read or written to — effectively inert.

### 2. Remove all per-query `fetchPolicy: 'network-only'` overrides

With the global default set to `no-cache`, all 8 existing `fetchPolicy: 'network-only'` lines become redundant and should be removed. This reduces boilerplate and ensures new queries automatically get the correct policy.

### 3. Derive `WaveCard` `cacheKey` from `photo.id`, matching `ImageView` pattern

With the backend schema change (`Wave.photos: [Photo]` instead of `[String]`), the `listWaves` query now requests `photos { id thumbUrl }`. `WaveCard` uses `photo.thumbUrl` as the image source, `cacheKey={\`${photo.id}-thumb\`}` (matching the established `ImageView` pattern in `ImageView.js`), and React `key={photo.id}` to force `CachedImage` remount when photos change (required because `expo-cached-image` has an empty-deps `useEffect` that never re-fires on prop changes).

This also means `WaveCard` shares the on-disk cache with `ImageView` — if a thumbnail was already loaded in the photo feed, it won't be downloaded again in the waves list.

## Risks / Trade-offs

- [Risk] A future query might intentionally want caching → Any such query can override the default with `fetchPolicy: 'cache-first'` on a per-query basis. The default is safely overridable.
- [Trade-off] Every query now always hits the network → This is already the intended behavior; 11 queries were accidentally caching. No new network load is introduced for the 8 queries that already used `network-only`.
- [Benefit] Using `photo.id` as cacheKey shares disk cache between `WaveCard` and `ImageView` — thumbnails loaded in one context are reused in the other with zero extra downloads.
