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

### 3. Derive `WaveCard` `cacheKey` from URL, not position index

Currently: `cacheKey={`wave-thumb-${wave.waveUuid}-${index}`}`. When photos shift in the array, the same cacheKey maps to a different URL but `expo-cached-image` serves the old bitmap.

Fix: extract a stable identifier from the photo URL itself. S3/CloudFront URLs contain unique filenames — use the last path segment as part of the cacheKey.

## Risks / Trade-offs

- [Risk] A future query might intentionally want caching → Any such query can override the default with `fetchPolicy: 'cache-first'` on a per-query basis. The default is safely overridable.
- [Trade-off] Every query now always hits the network → This is already the intended behavior; 11 queries were accidentally caching. No new network load is introduced for the 8 queries that already used `network-only`.
- [Risk] Deriving cacheKey from URL could create long keys → Using only the filename portion keeps keys short and unique.
