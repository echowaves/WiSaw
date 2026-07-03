# Wave Photo Sorting Consistency Fix — Design

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           WavesHub Screen                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │  WaveCard Component                                                  │    │
│  │  ┌───────────────────────────────────────────────────────────────┐   │    │
│  │  │  WavePhotoStrip Component                                     │   │    │
│  │  │  ┌─────────────────────────────────────────────────────────┐  │   │    │
│  │  │  │  Photos Array (from listWaves)                          │  │   │    │
│  │  │  │  - id                                                    │  │   │    │
│  │  │  │  - thumbUrl                                              │  │   │    │
│  │  │  │  - updatedAt    ←─ NEW (was missing)                    │  │   │    │
│  │  │  └─────────────────────────────────────────────────────────┘  │   │    │
│  │  │                                                                │   │    │
│  │  │  useEffect: Compare initialPhotos                             │   │    │
│  │  │  - Check ID changes (existing)                                │   │    │
│  │  │  - Check updatedAt changes (NEW)                              │   │    │
│  │  │  - If any change detected → update internal state             │   │    │
│  │  └───────────────────────────────────────────────────────────────┘   │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                              │
                              │ listWaves query
                              │ (network-only, no cache)
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        GraphQL Layer (Apollo)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │  listWaves Query                                                     │    │
│  │  variables: { pageNumber, batch, uuid, searchTerm }                  │    │
│  │                                                                       │    │
│  │  query listWaves {                                                   │    │
│  │    listWaves(pageNumber: $pageNumber, batch: $batch,                │    │
│  │                  uuid: $uuid, searchTerm: $searchTerm) {             │    │
│  │      waves {                                                         │    │
│  │        waveUuid, name, photosCount...                               │    │
│  │        photos {                                                      │    │
│  │          id, thumbUrl, updatedAt  ←─ UPDATED                        │    │
│  │        }                                                             │    │
│  │      }                                                               │    │
│  │    }                                                                 │    │
│  │  }                                                                   │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│                              │                                                │
│                              │ PostgreSQL Query                               │
│                              ▼                                                │
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Backend (AWS Lambda)                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │  lambda-fns/controllers/waves/listWaves.ts                         │    │
│  │                                                                       │    │
│  │  Photos query:                                                       │    │
│  │  SELECT "WavePhotos"."waveUuid",                                    │    │
│  │         "Photos".*,                                                 │    │
│  │         ROW_NUMBER() OVER (PARTITION BY "WavePhotos"."waveUuid"     │    │
│  │                                ORDER BY "Photos"."updatedAt" DESC)  │    │
│  │  WHERE "WavePhotos"."waveUuid" = ANY($1)                            │    │
│  │    AND "Photos"."active" = true                                     │    │
│  │  ORDER BY row_num <= 5                                              │    │
│  │                                                                       │    │
│  │  Result: Array of photos with updatedAt field                      │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                          WaveDetail Screen                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │  PhotosListMasonry                                                   │    │
│  │  ┌───────────────────────────────────────────────────────────────┐   │    │
│  │  │  Photos Array (from feedForWave)                            │   │    │
│  │  │  - id                                                    │   │    │
│  │  │  - thumbUrl                                              │   │    │
│  │  │  - updatedAt    ←─ NEW (added for consistency)           │   │    │
│  │  └───────────────────────────────────────────────────────────┘   │    │
│  │                                                                    │    │
│  │  Sorted by: updatedAt DESC (most recent first)                   │    │
│  └───────────────────────────────────────────────────────────────────┘    │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                              │
                              │ feedForWave query
                              │ (network-only, no cache)
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Backend (AWS Lambda)                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │  lambda-fns/controllers/photos/feedForWave.ts                      │    │
│  │                                                                       │    │
│  │  SELECT p.*                                                          │    │
│  │  FROM "Photos" p                                                     │    │
│  │  INNER JOIN "WavePhotos" wp                                          │    │
│  │    ON p.id = wp."photoId"                                            │    │
│  │  WHERE wp."waveUuid" = $1                                            │    │
│  │    AND p.active = true                                               │    │
│  │  ORDER BY p."updatedAt" DESC    ←─ Consistent with listWaves       │    │
│  │  LIMIT $2                                                            │    │
│  │  OFFSET $3                                                           │    │
│  │                                                                       │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Before (Broken)

```
1. WavesHub renders WaveCard with wave.photos = [A, B, C]
   ↓
2. WavePhotoStrip receives initialPhotos = [A, B, C]
   ↓
3. User adds comment to photo A
   ↓
4. WaveDetail refetches photos → gets [A, B, C] with A's updatedAt updated
   ↓
5. listWaves refetches (via useFocusEffect)
   ↓
6. Returns [A, B, C] but WavePhotoStrip compares IDs only
   ↓
7. All IDs (A, B, C) still present → NO STATE UPDATE
   ↓
8. UI shows stale order until app restart ❌
```

### After (Fixed)

```
1. WavesHub renders WaveCard with wave.photos = [A, B, C]
   ↓
2. WavePhotoStrip receives initialPhotos = [A, B, C] (includes updatedAt)
   ↓
3. User adds comment to photo A
   ↓
4. WaveDetail refetches photos → gets [A, B, C] with A's updatedAt updated
   ↓
5. listWaves refetches (via useFocusEffect)
   ↓
6. Returns [A, B, C] with updated timestamps
   ↓
7. WavePhotoStrip compares both IDs AND updatedAt timestamps
   ↓
8. Detects A.updatedAt changed → STATE UPDATES ✅
   ↓
9. UI shows correct order [A, B, C] immediately ✅
```

## Component Changes

### WavePhotoStrip (`src/components/WavePhotoStrip/index.js`)

**Current Logic (Lines 37-55):**
```javascript
// Sync internal photos state when initialPhotos prop changes
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

**New Logic:**
```javascript
// Sync internal photos state when initialPhotos prop changes
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

## GraphQL Changes

### listWaves Query (`src/screens/Waves/reducer.js`)

**Before:**
```graphql
photos {
  id
  thumbUrl
}
```

**After:**
```graphql
photos {
  id
  thumbUrl
  updatedAt
}
```

### feedForWave Query (`src/screens/WaveDetail/reducer.js`)

**Before:**
```graphql
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
```graphql
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

## Testing Strategy

### Unit Tests

1. **WavePhotoStrip timestamp detection**
   - Given same IDs but different timestamps → state should update
   - Given same IDs and timestamps → state should NOT update
   - Given new photo IDs → state should update (existing behavior)

2. **GraphQL query responses**
   - Verify `listWaves` returns `updatedAt` for each photo
   - Verify `feedForWave` returns `updatedAt` for each photo

### Integration Tests

1. **Photo comment update flow**
   - Add comment to photo in WaveDetail
   - Verify WavesHub refreshes
   - Verify photo order updates in WaveCard

2. **Photo delete flow**
   - Delete photo from WaveDetail
   - Verify WavesHub refreshes
   - Verify photo count and order update

3. **Pull refresh flow**
   - Pull to refresh on WavesHub
   - Verify fresh data with correct sort order

## Migration Notes

- No database migrations needed
- No breaking changes to existing APIs
- Backward compatible: `updatedAt` is optional in frontend logic
- Apollo cache behavior unchanged: `fetchPolicy: 'network-only'` ensures fresh data
