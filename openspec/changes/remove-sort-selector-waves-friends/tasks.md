## 1. Remove sort state from src/state.js

- [x] 1.1 Remove `waveSortBy` atom from `src/state.js`
- [x] 1.2 Remove `waveSortDirection` atom from `src/state.js`
- [x] 1.3 Remove `friendsSortBy` atom from `src/state.js`
- [x] 1.4 Remove `friendsSortDirection` atom from `src/state.js`
- [x] 1.5 Verify no other atoms depend on these (grep for imports)

## 2. Update WavesHub — remove sort UI and state

- [x] 2.1 Remove `import SortOrderPicker` from `src/screens/WavesHub/index.js`
- [x] 2.2 Remove `waveSortBy` and `waveSortDirection` atom usage (lines 59-60)
- [x] 2.3 Remove `sortPickerVisible` state, `sortOptions`, and `handleSortChange` (lines 116-127)
- [x] 2.4 Remove Sort icon button from header (lines 220-245)
- [x] 2.5 Remove `<SortOrderPicker>` render (line 728)
- [x] 2.6 Remove `sortBy` and `sortDirection` from `loadWaves` call to `reducer.listWaves()`
- [x] 2.7 Remove `sortBy` and `sortDirection` from `loadWaves` useCallback dependencies
- [x] 2.8 Replace client-side sort in `filteredWaves` with fixed `createdAt` desc sort

## 3. Update FriendsList — remove sort UI and state

- [x] 3.1 Remove `import SortOrderPicker` from `src/screens/FriendsList/index.js`
- [x] 3.2 Remove `friendsSortBy` and `friendsSortDirection` atom usage (lines 39-40)
- [x] 3.3 Remove `sortOptions` and `handleSortChange` (lines 105-111)
- [x] 3.4 Remove Sort icon button from header
- [x] 3.5 Remove `<SortOrderPicker>` render (line 484)
- [x] 3.6 Replace client-side sort in `sortedAndFilteredFriends` with fixed `createdAt` desc sort

## 4. Update root layout — remove dead references

- [x] 4.1 Remove `const [, setWaveSortBy] = useAtom(STATE.waveSortBy)` from `app/_layout.tsx` (line 58)
- [x] 4.2 Remove `const [, setWaveSortDirection] = useAtom(STATE.waveSortDirection)` from `app/_layout.tsx` (line 59)

## 5. Update specs

- [x] 5.1 Update `openspec/specs/friends-sort/spec.md` to reflect fixed `createdAt` desc sort, no picker, no atoms
- [x] 5.2 Check if `openspec/specs/wave-sort-persistence/spec.md` exists and mark as retired or remove
- [x] 5.3 Check if `openspec/specs/waves-list-sort/spec.md` exists and mark as retired or remove

## 6. Verify implementation

- [x] 6.1 Test WavesHub: no sort button in header, waves display newest first by `createdAt`
- [x] 6.2 Test FriendsList: no sort button in header, friends display newest first by `createdAt`, pending friends pinned to top
- [x] 6.3 Verify no TypeScript/lint errors (only pre-existing unrelated TS errors remain)
- [x] 6.4 Verify no remaining references to removed atoms in codebase
