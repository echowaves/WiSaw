## 1. Sort State and Persistence

- [x] 1.1 Add jotai atoms for wave feed sort (`waveFeedSortBy`, `waveFeedSortDirection`) and friend feed sort (`friendFeedSortBy`, `friendFeedSortDirection`) in `src/state.js`
- [x] 1.2 Add SecureStore persistence functions for feed sort preferences in `src/utils/waveStorage.js` (or a shared storage util), following the existing `saveWaveSortPreferences`/`loadWaveSortPreferences` pattern
- [x] 1.3 Load persisted sort preferences on app startup

## 2. Wave Detail Sort

- [x] 2.1 Update `fetchWavePhotos` in `src/screens/WaveDetail/reducer.js` to accept and pass `sortBy`/`sortDirection` to the `feedForWave` GraphQL query
- [x] 2.2 In `src/screens/WaveDetail/index.js`, read sort atoms and pass to `loadPhotos`; add `useEffect` to re-fetch when sort changes
- [x] 2.3 Add sort options (separator + 4 items with checkmarks) to the wave detail kebab menu in `app/(drawer)/waves/[waveUuid].tsx`

## 3. Friend Detail Sort

- [x] 3.1 Update `fetchFriendPhotos` in `src/screens/FriendDetail/reducer.js` to accept and pass `sortBy`/`sortDirection` to the `feedForFriend` GraphQL query
- [x] 3.2 In `src/screens/FriendDetail/index.js`, read sort atoms and pass to `loadPhotos`; add `useEffect` to re-fetch when sort changes
- [x] 3.3 Add sort options (separator + 4 items with checkmarks) to the friend detail kebab menu in `app/friendships/[friendUuid].tsx`
