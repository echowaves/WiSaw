# Tasks: Fix Wave List Sorting

## 1. Remove Client-Side Sort from WavesHub

- [x] 1.1 Delete the `filteredWaves` useMemo from `src/screens/WavesHub/index.js`
- [x] 1.2 Replace `data={filteredWaves}` with `data={waves}` in the FlatList
- [x] 1.3 Verify no other references to `filteredWaves` remain in the file

## 2. Verify Consistency

- [x] 2.1 Confirm `WaveSelectorModal` already uses `waves` directly (already correct — `filteredWaves = waves`)
- [x] 2.2 Confirm `MergeWaveModal` only uses client-side filter for source-wave exclusion (already correct)
- [x] 2.3 Verify `handleLoadMore` passes `debouncedSearch` to maintain filter context across pages
