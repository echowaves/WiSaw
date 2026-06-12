## Context

The `WavePhotoStrip` component (`src/components/WavePhotoStrip/index.js`) receives `initialPhotos` from `WaveCard`, which passes `wave.photos` from the `listWaves` GraphQL response. The component stores it in internal state via `useState(initialPhotos)`, which only sets the initial value once.

The component also supports pagination via `fetchFn` — when the user scrolls to the end, `handleLoadMore` appends additional photos. This creates a stale state problem on two levels:

1. **Photos data stale**: `useState(initialPhotos)` doesn't react to prop changes
2. **Pagination metadata stale**: `pageNumber`, `noMoreData`, `stopLoading.current` are never reset when the parent refreshes

### State Lifecycle

```
Mount:
  pageNumber = -1, noMoreData = false, stopLoading = false
  → user scrolls right, fetches page 0 → pageNumber = 0
  → user scrolls right, fetches page 1 → pageNumber = 1
  → user scrolls right, fetches page 2 → pageNumber = 2

Refresh (new initialPhotos from WavesHub):
  initialPhotos changes ✓  (useEffect fires, setPhotos syncs)
  pageNumber = 2 ✗  (stale — next fetch would try page 3)
  noMoreData = true ✗  (stale — handleLoadMore returns early)
  stopLoading = true ✗  (stale — blocks any fetch)

After user scrolls right:
  handleLoadMore() checks: noMoreData === true → returns immediately
  → No photos load. User sees only the initial 5.
```

## Design Decisions

### 1. useEffect to sync all stale state on initialPhotos change

**Change**: Extend the `useEffect` that reacts to `initialPhotos` to also reset pagination metadata:

```javascript
useEffect(() => {
  setPhotos(initialPhotos)
  setPageNumber(-1)
  setNoMoreData(false)
  stopLoading.current = false
}, [initialPhotos])
```

**Why**: All four pieces of state are part of the same "data snapshot" — they belong together. When the server data changes, the entire snapshot must reset. Resetting `pageNumber` ensures pagination starts from page 0. Clearing `noMoreData` allows `handleLoadMore` to fire. Clearing `stopLoading` prevents a stuck guard from blocking the first fetch.

**Interaction with pagination**: On the first render, `initialPhotos` comes from `loadWaves(page=0)` with fresh server data. The `useEffect` syncs it immediately along with pagination reset (which are already at default values, so the reset is idempotent). If the user then paginates, `handleLoadMore` appends photos. If the user later refreshes, the entire snapshot resets and pagination can begin again from page 0.

### 2. No key prop change on WaveCard

**Decision**: Do NOT add a `key` prop to `WavePhotoStrip` to force remount on each refresh.

**Why**: A `key` change would unmount and remount the component. While this would reset all state, it would also cause a visible flicker and is more disruptive than a targeted state reset. The `useEffect` approach preserves the component instance and resets exactly the state that needs resetting.

### 3. Minimal change scope

**Decision**: Only modify `WavePhotoStrip/index.js` — no other files changed.

**Why**: The bug is isolated to one component. The fix is 6 lines of code (3 state resets + 2 dependency entries + closing brace). No other components need modification.
