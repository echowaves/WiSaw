## Why

When `handleRefresh()` in WavesHub is called (e.g., after auto-grouping or upload completion), it triggers `loadWaves()` which fetches fresh data from the server and updates the `waves` Jotai state. The `WaveCard` components re-render with new `wave.photos` arrays.

`WavePhotoStrip` receives the new `initialPhotos` prop but has two stale state problems:

**Problem 1: Photos state stale**
`useState(initialPhotos)` only captures the value on first mount. On subsequent prop updates, the internal `photos` state becomes stale and never reflects the fresh data.

Timeline:
1. Initial load: Wave A has photos [p1, p2, p3] → WavePhotoStrip photos state = [p1, p2, p3]
2. User uploads pNew to Wave A → handleRefresh() → listWaves returns Wave A with [p1, p2, p3, pNew]
3. WaveCard re-renders with wave.photos = [p1, p2, p3, pNew]
4. WavePhotoStrip receives initialPhotos = [p1, p2, p3, pNew] but useState ignores it
5. UI still shows only [p1, p2, p3] — pNew never appears until user navigates away and back

**Problem 2: Pagination metadata stale**
Even after fixing the photos sync, `pageNumber` (e.g., `2`), `noMoreData` (`true`), and `stopLoading.current` (`true`) remain stuck at their pre-refresh values. When the user scrolls to the end:

```
handleLoadMore() checks:
  if (!fetchFn || noMoreData || stopLoading.current) return
                              ^^^^^^^^^^^ still true from before!
  → returns early, no fetch happens
```

Result: photos only show the first 5 from the initial `listWaves` batch, and horizontal scrolling to load more silently does nothing.

## What Changes

- Add a `useEffect` in `WavePhotoStrip` to sync internal state when `initialPhotos` prop changes
- Reset `pageNumber` to `-1`, `noMoreData` to `false`, and `stopLoading.current` to `false` alongside `photos`

## Impact

- **Files modified**:
  - `src/components/WavePhotoStrip/index.js` — extend useEffect to reset pagination state (3 additional lines)
- **Files to update**:
  - `openspec/specs/wave-hub/spec.md` — ensure spec captures full pagination reset requirement
- **No other components affected**
