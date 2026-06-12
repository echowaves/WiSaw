# Tasks: Fix WavePhotoStrip Stale Photos State

## Phase 1: Fix Stale State in WavePhotoStrip

### Task 1.1: Add useEffect to sync all stale state on initialPhotos change
- [x] In `src/components/WavePhotoStrip/index.js`, extend the existing `useEffect([initialPhotos])` to also reset pagination metadata
- [x] Add `setPageNumber(-1)` to reset pagination counter
- [x] Add `setNoMoreData(false)` to re-enable `handleLoadMore`
- [x] Add `stopLoading.current = false` to clear any stuck loading guard
- [x] Ensure `useEffect` is placed after the `useState` declarations and before the `autoScrollTrigger` effect

**Before**:
```javascript
useEffect(() => {
  setPhotos(initialPhotos)
}, [initialPhotos])
```

**After**:
```javascript
useEffect(() => {
  setPhotos(initialPhotos)
  setPageNumber(-1)
  setNoMoreData(false)
  stopLoading.current = false
}, [initialPhotos])
```

**Files**: `src/components/WavePhotoStrip/index.js`

**Acceptance**:
- When `initialPhotos` prop changes, `photos`, `pageNumber`, `noMoreData`, and `stopLoading.current` all reset
- Photos appear in the strip immediately after refresh without navigation
- Horizontal scrolling to load more photos works after refresh (pagination metadata is fresh)
- No component remounting (no key prop changes)
