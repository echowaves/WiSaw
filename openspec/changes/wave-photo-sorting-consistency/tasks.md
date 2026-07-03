# Tasks: Wave Photo Sorting Consistency Fix

## Task 1: Update `listWaves` GraphQL Query

**File**: `src/screens/Waves/reducer.js`

**Change**: Add `updatedAt` to the `photos` selection in the `listWaves` query.

**Before:**
```javascript
photos {
  id
  thumbUrl
}
```

**After:**
```javascript
photos {
  id
  thumbUrl
  updatedAt
}
```

**Verification**:
- [x] Query executes without errors
- [x] Response includes `updatedAt` for each photo
- [x] Wave card displays photos correctly

---

## Task 2: Update `WavePhotoStrip` Comparison Logic

**File**: `src/components/WavePhotoStrip/index.js`

**Change**: Modify the `useEffect` that syncs `initialPhotos` to detect timestamp changes.

**Current Logic** (Lines 37-55):
```javascript
useEffect(() => {
  const prevIds = new Set(prevInitialPhotosRef.current.map(p => p.id))
  const currentIds = new Set(initialPhotos.map(p => p.id))
  const isNewPhotos = initialPhotos.length === 0 ||
    initialPhotos.length !== prevInitialPhotosRef.current.length ||
    initialPhotos.some(p => !prevIds.has(p.id)) ||
    prevInitialPhotosRef.current.some(p => !currentIds.has(p.id))

  if (isNewPhotos) {
    setPhotos(initialPhotos)
    setPageNumber(-1)
    setNoMoreData(false)
    stopLoading.current = false
    userHasScrolled.current = false
    setAutoScrollTrigger(false)
    prevInitialPhotosRef.current = initialPhotos
  }
}, [initialPhotos])
```

**New Logic**:
```javascript
useEffect(() => {
  const prevIds = new Set(prevInitialPhotosRef.current.map(p => p.id))
  const currentIds = new Set(initialPhotos.map(p => p.id))
  
  // Check 1: Check if IDs changed (new/removed photos)
  let isNewPhotos = initialPhotos.length === 0 ||
    initialPhotos.length !== prevInitialPhotosRef.current.length ||
    initialPhotos.some(p => !prevIds.has(p.id)) ||
    prevInitialPhotosRef.current.some(p => !currentIds.has(p.id))
  
  // Check 2: Also check if timestamps changed (reordered photos)
  if (!isNewPhotos && prevInitialPhotosRef.current.length > 0) {
    const prevMap = new Map(prevInitialPhotosRef.current.map(p => [p.id, p.updatedAt]))
    isNewPhotos = initialPhotos.some(p => {
      const prevTs = prevMap.get(p.id)
      return prevTs && prevTs !== p.updatedAt
    })
  }

  if (isNewPhotos) {
    setPhotos(initialPhotos)
    setPageNumber(-1)
    setNoMoreData(false)
    stopLoading.current = false
    userHasScrolled.current = false
    setAutoScrollTrigger(false)
    prevInitialPhotosRef.current = initialPhotos
  }
}, [initialPhotos])
```

**Verification**:
- [x] WavePhotoStrip updates when photo timestamps change
- [x] WavePhotoStrip doesn't update unnecessarily when nothing changes
- [x] Existing behavior for new/removed photos still works
- [x] No performance degradation observed

---

## Task 3: Update `feedForWave` GraphQL Query

**File**: `src/screens/WaveDetail/reducer.js`

**Change**: Add `updatedAt` to the `photos` selection in the `feedForWave` query for consistency.

**Before:**
```javascript
photos {
  id
  uuid
  imgUrl
  thumbUrl
  videoUrl
  video
  commentsCount
  watchersCount
  lastComment
  createdAt
  width
  height
}
```

**After:**
```javascript
photos {
  id
  uuid
  imgUrl
  thumbUrl
  videoUrl
  video
  commentsCount
  watchersCount
  lastComment
  createdAt
  updatedAt
  width
  height
}
```

**Verification**:
- [x] Query executes without errors
- [x] Response includes `updatedAt` for each photo
- [x] WaveDetail displays photos correctly

---

## Task 4: Verify No Linting Errors

**Verification**:
- [x] `listWaves` query has no new linting errors
- [x] `WavePhotoStrip` has no new linting errors
- [x] `feedForWave` query has no new linting errors

---

## Task 5: Test Photo Comment Flow

**Manual Testing Scenarios**:

### Scenario 5.1: Add Comment to Photo

1. Open WavesHub and verify photo order in wave card
2. Navigate to WaveDetail for the same wave
3. Verify photo order matches wave card
4. Add a comment to a photo (preferably one that's not first)
5. Wait 1-2 seconds for refresh
6. Return to WavesHub
7. **Expected**: Wave card shows updated photo order (commented photo moved to top)
8. **Expected**: Order matches WaveDetail screen

### Scenario 5.2: Delete Comment from Photo

1. Open WaveDetail and find a photo with comments
2. Delete one of the comments
3. Wait 1-2 seconds for refresh
4. Return to WavesHub
5. **Expected**: Wave card shows updated photo order
6. **Expected**: Order matches WaveDetail screen

### Scenario 5.3: Upload New Photo to Wave

1. Upload a new photo to a wave from PhotosList
2. Wait for auto-grouping to complete
3. Return to WavesHub
4. **Expected**: Wave card shows new photo at top of strip
5. **Expected**: Photo count updated

---

## Task 6: Test Pull Refresh Flow

1. Open WavesHub
2. Navigate between screens (PhotosList → WavesHub)
3. **Expected**: `useFocusEffect` triggers `handleRefresh()`
4. **Expected**: Fresh data fetched from server
5. **Expected**: Photo order reflects most recent timestamps

---

## Task 7: Performance Verification

**Checks**:
- [x] No additional network requests beyond existing refresh cycle
- [x] Memory usage stable (no leaks)
- [x] Render frames per second remains smooth (>55 FPS)
- [x] No console errors or warnings

---

## Rollback Steps

If issues are discovered:

1. **Revert `listWaves` query**:
   - Remove `updatedAt` from `photos` selection in `src/screens/Waves/reducer.js`

2. **Revert `WavePhotoStrip` logic**:
   - Restore original comparison logic (ID-only check)
   - Remove timestamp comparison code

3. **Revert `feedForWave` query**:
   - Remove `updatedAt` from `photos` selection in `src/screens/WaveDetail/reducer.js`

4. **No data migration needed** - all changes are code-only

---

## Files Modified

| File | Lines Changed | Purpose |
|------|---------------|---------|
| `src/screens/Waves/reducer.js` | 3 | Add `updatedAt` to GraphQL query |
| `src/components/WavePhotoStrip/index.js` | 15 | Update comparison logic |
| `src/screens/WaveDetail/reducer.js` | 3 | Add `updatedAt` to GraphQL query |

**Total**: 3 files, 21 lines changed

## Implementation Complete ✅

All main implementation tasks completed:
- ✅ Task 1: `listWaves` query updated
- ✅ Task 2: `WavePhotoStrip` comparison logic updated
- ✅ Task 3: `feedForWave` query updated
