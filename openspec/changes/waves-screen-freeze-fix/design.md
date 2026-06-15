# Design: Fix Waves Screen Freeze

## Overview

Fix the Waves screen freeze by ensuring `handleRefresh` operations complete properly and preventing concurrent refresh cycles.

## Changes

### 1. Make handleRefresh Async

**File**: `src/screens/WavesHub/index.js`

**Current**:
```javascript
const handleRefresh = useCallback(() => {
  stopLoading.current = false
  setRefreshing(true)
  setPageNumber(0)
  setNoMoreData(false)
  const newBatch = Crypto.randomUUID()
  setBatch(newBatch)
  loadWaves(0, newBatch, true, debouncedSearch || undefined)
  fetchCounts()
}, [loadWaves, debouncedSearch, fetchCounts])
```

**Proposed**:
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

### 2. Add Refresh Guard

Add a ref to prevent concurrent refresh calls:

```javascript
const stopLoading = useRef(false)
const currentBatchRef = useRef(null)
const refreshRunningRef = useRef(false)  // NEW
const hasMountedRef = useRef(false)
const autoGroupRunningRef = useRef(false)
```

Wrap `handleRefresh` implementation:

```javascript
const handleRefresh = useCallback(async () => {
  if (refreshRunningRef.current) return
  refreshRunningRef.current = true
  try {
    stopLoading.current = false
    setRefreshing(true)
    setPageNumber(0)
    setNoMoreData(false)
    const newBatch = Crypto.randomUUID()
    setBatch(newBatch)
    
    await Promise.all([
      loadWaves(0, newBatch, true, debouncedSearch || undefined),
      fetchCounts()
    ])
  } finally {
    refreshRunningRef.current = false
  }
}, [loadWaves, debouncedSearch, fetchCounts])
```

### 3. Remove Double Refresh

In `runAutoGroup`, keep only the `emitAutoGroupDone()` call and remove the direct `handleRefresh()` call:

**Current**:
```javascript
setUngroupedPhotosCount(result.photosRemaining ?? 0)
handleRefresh()  // REMOVE THIS
emitAutoGroupDone()
```

**Proposed**:
```javascript
setUngroupedPhotosCount(result.photosRemaining ?? 0)
emitAutoGroupDone()  // This already triggers handleRefresh
```

## Testing

1. **Test auto-group completion**: Take photos, trigger auto-group, verify no freeze on navigation
2. **Test rapid uploads**: Take multiple batches of photos in quick succession, verify no freeze
3. **Test rapid navigation**: Navigate to Waves, back, to Waves again rapidly, verify no freeze

## Rollback Plan

If issues arise, revert the changes to `handleRefresh` and restore the double refresh behavior.
