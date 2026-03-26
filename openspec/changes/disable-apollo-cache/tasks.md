## 1. Set Global `no-cache` Default

- [x] 1.1 In `src/consts.js`, add `defaultOptions: { query: { fetchPolicy: 'no-cache' }, watchQuery: { fetchPolicy: 'no-cache' }, mutate: { fetchPolicy: 'no-cache' } }` to the `ApolloClient` constructor.

## 2. Remove Per-Query `fetchPolicy` Overrides

- [x] 2.1 In `src/screens/Waves/reducer.js`, remove both `fetchPolicy: 'network-only'` lines.
- [x] 2.2 In `src/screens/WaveDetail/reducer.js`, remove the `fetchPolicy: 'network-only'` line.
- [x] 2.3 In `src/screens/Chat/reducer.js`, remove the `fetchPolicy: 'network-only'` line.
- [x] 2.4 In `src/screens/FriendsList/friends_helper.js`, remove both `fetchPolicy: 'network-only'` lines.
- [x] 2.5 In `src/screens/PhotoSelectionMode/index.js`, remove the `fetchPolicy: 'network-only'` line.
- [x] 2.6 In `src/components/Photo/reducer.js`, remove the `fetchPolicy: 'network-only'` line.

## 3. Fix WaveCard Thumbnail Cache Key

- [x] 3.1 In `src/components/WaveCard/index.js`, change the `CachedImage` `cacheKey` from position-based (`wave-thumb-${wave.waveUuid}-${index}`) to URL-derived (extract filename from the photo URL).
