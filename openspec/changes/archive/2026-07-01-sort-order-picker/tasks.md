## 1. SortOrderPicker Component

- [x] 1.1 Create `src/components/SortOrderPicker/index.js` with segmented mode layout
- [x] 1.2 Add grid mode layout (2×2) for 4-option mode
- [x] 1.3 Implement dark mode color variants using `isDarkMode` prop
- [x] 1.4 Add overlay tap-to-dismiss and Done button dismiss
- [x] 1.5 Verify active state detection logic (sortBy + sortDirection matching)

## 2. FriendsList Integration

- [x] 2.1 Import `SortOrderPicker` into `src/screens/FriendsList/index.js`
- [x] 2.2 Replace `sortMenuVisible` state + `sortMenuItems` array with `SortOrderPicker` props
- [x] 2.3 Define Friends sort options array (3 segmented options: A-Z, Z-A, Recent)
- [x] 2.4 Wire `onSortChange` to call `setSortBy` and `setSortDirection`
- [x] 2.5 Remove the `ActionMenu` for sort (keep context menu ActionMenu intact)
- [x] 2.6 Verify Friends list still sorts correctly via existing `sortedAndFilteredFriends` useMemo

## 3. WavesHub Integration

- [x] 3.1 Import `SortOrderPicker` into `src/screens/WavesHub/index.js`
- [x] 3.2 Replace `headerMenuVisible` state + `headerMenuItems` array with `SortOrderPicker` props
- [x] 3.3 Define Waves sort options array (4 grid options with full labels)
- [x] 3.4 Wire `onSortChange` to call `setSortBy`, `setSortDirection`, and `saveWaveSortPreferences`
- [x] 3.5 Remove the sort `ActionMenu` (keep wave context menu ActionMenu intact)
- [x] 3.6 Verify Waves list still sorts correctly via existing `loadWaves` callback

## 4. Cleanup & Verification

- [x] 4.1 Verify no dangling references to removed sort menu state variables
- [ ] 4.2 Test dark mode on both screens
- [ ] 4.3 Test on small screen (320px width) for grid mode fit
- [ ] 4.4 Confirm ActionMenu still works for wave/friend context menus
