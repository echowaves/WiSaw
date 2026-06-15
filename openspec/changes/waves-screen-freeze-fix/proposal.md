# Fix Waves Screen Freeze on Navigation

## Problem

The Waves screen freezes on navigation after photo upload and auto-group cycles. The screen becomes unresponsive and requires app restart.

## Root Cause

The `handleRefresh` function in `WavesHub` is called from multiple sources:
- `useFocusEffect` (every time screen focuses)
- `subscribeToAutoGroupDone` (after auto-group completes)
- `subscribeToUploadComplete` (after photo uploads complete)

Each call runs two async operations:
1. `loadWaves(...)` - fetches waves list
2. `fetchCounts()` - fetches ungrouped count and waves count

**The problem**: These two calls run **concurrently** and **without awaiting**, so the order of completion is unpredictable.

When the user's reproduction scenario runs:
1. First upload works fine
2. Auto-group completes, `handleRefresh` is called
3. Photo upload completes, `handleRefresh` is called again
4. User navigates to Waves, `handleRefresh` is called
5. **Race condition**: `loadWaves` might complete before `fetchCounts`, so the screen renders with a stale `ungroupedCount`
6. `WavesExplainerView` shows wrong count, triggers auto-group with wrong data
7. Screen freezes

## Double Refresh After Auto-Group

When auto-group completes, `handleRefresh` is called TWICE:
1. Directly from `runAutoGroup` (after updating counts)
2. Via `subscribeToAutoGroupDone` listener

This double refresh could cause state corruption.

## Why

The root cause is a race condition in `handleRefresh` where async operations complete in an unpredictable order. When `loadWaves` finishes before `fetchCounts`, the waves list renders with stale ungrouped count data. This causes `WavesExplainerView` to show incorrect counts and trigger auto-group with wrong parameters, leading to the freeze.

The fix ensures `handleRefresh` waits for all operations before returning, adds a guard to prevent concurrent calls, and removes the redundant double refresh after auto-group.

## What Changes

The following files will be modified:
- `src/screens/WavesHub/index.js` - Make handleRefresh async, add guard, remove double refresh

## Solution

### 1. Make handleRefresh Async and Await Operations

```javascript
const handleRefresh = useCallback(async () => {
  stopLoading.current = false
  setRefreshing(true)
  setPageNumber(0)
  setNoMoreData(false)
  const newBatch = Crypto.randomUUID()
  setBatch(newBatch)
  
  // Wait for both operations to complete
  await Promise.all([
    loadWaves(0, newBatch, true, debouncedSearch || undefined),
    fetchCounts()
  ])
}, [loadWaves, debouncedSearch, fetchCounts])
```

### 2. Add Guard to Prevent Concurrent handleRefresh Calls

```javascript
const refreshRunningRef = useRef(false)

const handleRefresh = useCallback(async () => {
  if (refreshRunningRef.current) return
  refreshRunningRef.current = true
  try {
    // ... rest of implementation
  } finally {
    refreshRunningRef.current = false
  }
}, [loadWaves, debouncedSearch, fetchCounts])
```

### 3. Remove Double Refresh After Auto-Group

Remove the direct `handleRefresh()` call from `runAutoGroup` since `emitAutoGroupDone` already triggers it.

## Files to Modify

- `src/screens/WavesHub/index.js`

## Estimated Complexity

- **Task 1**: 2 points (make handleRefresh async)
- **Task 2**: 1 point (add guard)
- **Task 3**: 1 point (remove double refresh)
- **Task 4**: 1 point (testing)
- **Total**: 5 points
