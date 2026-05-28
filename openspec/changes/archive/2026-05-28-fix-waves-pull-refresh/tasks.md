## 1. Fix handleRefresh

- [x] 1.1 Add `loadingRef.current = false` at the start of `handleRefresh` in `src/screens/WavesHub/index.js`
- [x] 1.2 Add `setNoMoreData(false)` in `handleRefresh`
- [x] 1.3 Add `fetchCounts()` call at the end of `handleRefresh`
