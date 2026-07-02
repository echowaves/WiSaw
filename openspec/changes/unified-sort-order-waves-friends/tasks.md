## 1. Update FriendsList Sort

- [x] 1.1 Change SortOrderPicker mode from "segmented" to "arrows"
- [x] 1.2 Replace sort options array with A-Z (alphabetical, asc) and Recent (updatedAt, desc)
- [x] 1.3 Update sort logic in `sortedAndFilteredFriends` to use `updatedAt` instead of `createdAt` for "recentlyAdded" case
- [x] 1.4 Verify default atom values in `src/state.js` align with new options (friendsSortBy defaults to 'recentlyAdded' — update to 'alphabetical')

## 2. Update WavesHub Sort

- [x] 2.1 Replace sort options array with A-Z (name, asc) and Recent (updatedAt, desc)
- [x] 2.2 Add client-side sort for waves: when sortBy is 'name', sort the `filteredWaves` array by wave name after server fetch
- [x] 2.3 Update sort logic to handle 'name' sortBy key with direction toggle
- [x] 2.4 Verify default atom values in `src/state.js` align with new options (waveSortBy defaults to 'updatedAt' — update to 'name')
- [x] 2.5 Remove `saveWaveSortPreferences` call if no longer needed (sort state is now session-only via Jotai)

## 3. Update State Defaults

- [x] 3.1 Change `waveSortBy` atom default from `'updatedAt'` to `'name'` in `src/state.js`
- [x] 3.2 Change `friendsSortBy` atom default from `'recentlyAdded'` to `'alphabetical'` in `src/state.js`

## 4. Verify Implementation

- [x] 4.1 Test FriendsList: A-Z shows ▲, tap toggles to ▼ (Z-A), tap again returns to ▲
- [x] 4.2 Test FriendsList: Recent shows ▲ (newest first), tap toggles to ▼ (oldest first)
- [x] 4.3 Test WavesHub: A-Z shows ▲, tap toggles to ▼ (Z-A), tap again returns to ▲
- [x] 4.4 Test WavesHub: Recent shows ▲ (newest first), tap toggles to ▼ (oldest first)
- [x] 4.5 Verify no `createdAt` sort option appears in either screen
- [x] 4.6 Verify pending friends are still pinned to top regardless of sort
