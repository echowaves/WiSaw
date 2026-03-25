## 1. Shared API Layer

- [x] 1.1 Add `searchTerm` parameter to `listWaves` function in `src/screens/Waves/reducer.js` — add it as optional param, add `$searchTerm: String` to GQL query variables, and pass it in the variables object

## 2. WavesHub Server-Side Search

- [x] 2.1 Add debounced search state to `src/screens/WavesHub/index.js` — when `searchText` changes, debounce 300ms then call `loadWaves` with `searchTerm`, resetting to page 0 with a new batch
- [x] 2.2 Pass `searchTerm` from WavesHub to `reducer.listWaves` in the `loadWaves` function
- [x] 2.3 Remove client-side `waves.filter()` in WavesHub — use `waves` directly instead of `filteredWaves`

## 3. WaveSelectorModal Pagination + Search

- [x] 3.1 Add pagination state to `src/components/WaveSelectorModal/index.js` — `pageNumber`, `batch`, `noMoreData`, `loadingMore`
- [x] 3.2 Add `onEndReached` handler to WaveSelectorModal's FlatList to load next page
- [x] 3.3 Add debounced search in WaveSelectorModal — on `searchText` change, debounce 300ms, reset to page 0 with new batch, pass `searchTerm` to `listWaves`
- [x] 3.4 Remove client-side filter in WaveSelectorModal — use `waves` directly

## 4. MergeWaveModal Pagination + Search

- [x] 4.1 Add pagination state to `src/components/MergeWaveModal/index.js` — `pageNumber`, `batch`, `noMoreData`, `loadingMore`
- [x] 4.2 Add `onEndReached` handler to MergeWaveModal's FlatList to load next page
- [x] 4.3 Add debounced search in MergeWaveModal — on `searchText` change, debounce 300ms, reset to page 0 with new batch, pass `searchTerm` to `listWaves`
- [x] 4.4 Remove client-side filter in MergeWaveModal — use `waves` directly (still excluding source wave)
