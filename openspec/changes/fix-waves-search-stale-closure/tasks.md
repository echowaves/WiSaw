# Tasks: Fix Waves Search Stale Closure

## 1. Fix handleRefresh dependency array

- [x] 1.1 Add `debouncedSearch` to the `useCallback` dependency array of `handleRefresh` in `src/screens/WavesHub/index.js`
- [x] 1.2 Verify the dependency array is `[loadWaves, debouncedSearch]`

## 2. Verify no regressions

- [x] 2.1 Confirm `useEffect` still triggers on `[debouncedSearch]` (no change needed)
- [x] 2.2 Confirm `loadWaves` does not need `debouncedSearch` in its deps (receives it as parameter, not from closure)
