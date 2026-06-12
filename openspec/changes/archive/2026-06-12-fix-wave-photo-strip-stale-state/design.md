## Context

The `WavePhotoStrip` component (`src/components/WavePhotoStrip/index.js`) receives `initialPhotos` from `WaveCard`, which passes `wave.photos` from the `listWaves` GraphQL response. The component stores it in internal state via `useState(initialPhotos)`, which only sets the initial value once.

The component also supports pagination via `fetchFn` — when the user scrolls to the end, `handleLoadMore` appends additional photos. This creates a subtle interaction:

1. `useState(initialPhotos)` captures the first value
2. `handleLoadMore` appends to the captured value via `setPhotos(prev => [...prev, ...newPhotos])`
3. When `initialPhotos` changes (new data from server), the sync is broken

## Design Decisions

### 1. useEffect to sync initialPhotos

**Change**: Add a `useEffect` that sets `photos` when `initialPhotos` changes:

```javascript
useEffect(() => {
  setPhotos(initialPhotos)
}, [initialPhotos])
```

**Why**: This is the simplest correct fix. It ensures the internal state always reflects the latest prop value when it changes.

**Interaction with pagination**: On the first render, `initialPhotos` comes from `loadWaves(page=0)` with fresh server data. The `useEffect` syncs it immediately. If the user then paginates, `handleLoadMore` appends to the synced value. If the user later refreshes (via focus or pull-to-refresh), `initialPhotos` changes again and the `useEffect` syncs — overwriting any pagination additions. This is correct behavior because `handleRefresh` resets the entire app state and the server data should become the source of truth.

### 2. No key prop change on WaveCard

**Decision**: Do NOT add a `key` prop to `WavePhotoStrip` to force remount on each refresh.

**Why**: A `key` change would unmount and remount the component, resetting all internal state including `pageNumber` and `noMoreData`. This would silently break pagination logic and could cause flickering. The `useEffect` approach preserves the component instance and only resets the `photos` data — which is exactly what we want.

### 3. Minimal change scope

**Decision**: Only modify `WavePhotoStrip/index.js` — no other files changed.

**Why**: The bug is isolated to one component. The fix is 3 lines of code. No other components need modification.
