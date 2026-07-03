# Wave Photo Sorting Consistency Fix

description: Fix photo sort order inconsistency between wave card and wave detail screen

## Problem Statement

Photos in the wave card (WavesHub) show a different sort order than photos in the wave detail screen (WaveDetail) when photos are updated (comment added/deleted). The correct order appears on first render, but after a photo update, the wave card's photo strip shows stale order until app restart.

## Root Cause

1. **Missing `updatedAt` field in `listWaves` query**: The GraphQL query only fetches `photos { id thumbUrl }`, excluding the `updatedAt` timestamp needed to detect when photo order has changed.

2. **Flawed state comparison in WavePhotoStrip**: The component compares photos by ID only. If same photo IDs exist but their order changed (due to `updatedAt` changes), no state update triggers because all IDs are still present.

### Example Scenario

1. Initial: `photos = [A, B, C]` (sorted by `updatedAt DESC`)
2. User adds comment to photo A → A's `updatedAt` becomes newest
3. Backend returns: `photos = [A, B, C]` but A now has newest timestamp
4. WavePhotoStrip comparison: All IDs (A, B, C) still present → **no state update**
5. UI shows stale order: `[B, C, A]` instead of `[A, B, C]`

## Goals / Non-Goals

**Goals:**
- Ensure wave card photos show same sort order as wave detail screen
- Photo ordering updates immediately when photos are modified (comments added/deleted)
- Eliminate need for app restart to see updated photo order
- Maintain performance - minimal additional queries/data transfer

**Non-Goals:**
- Changing the backend sort order (already correct: `updatedAt DESC`)
- Adding new sort options or UI controls
- Modifying the photo display component behavior beyond fixing the cache issue

## Context

### Current State

```
WavesHub (WaveCard)          WaveDetail
└─ listWaves query           └─ feedForWave query
   └─ photos { id thumbUrl }    └─ photos { id uuid imgUrl thumbUrl ... createdAt width height }
   └─ Sort: updatedAt DESC      └─ Sort: updatedAt DESC
```

**Issue**: WavePhotoStrip receives `initialPhotos` without timestamps, so it cannot detect when order has changed.

### Backend Sort Order (Verified Correct)

Both queries correctly sort by `updatedAt DESC`:

**`listWaves`** (from `lambda-fns/controllers/waves/listWaves.ts`):
```sql
ROW_NUMBER() OVER (PARTITION BY "WavePhotos"."waveUuid" ORDER BY "Photos"."updatedAt" DESC)
```

**`feedForWave`** (from `lambda-fns/controllers/photos/feedForWave.ts`):
```sql
ORDER BY p."updatedAt" DESC
```

## Decision

### Decision 1: Add `updatedAt` to `listWaves` query

Update the GraphQL query in `src/screens/Waves/reducer.js` to include `updatedAt` in the photos selection:

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

### Decision 2: Update WavePhotoStrip comparison logic

Modify `src/components/WavePhotoStrip/index.js` to detect when photo order has changed by comparing timestamps:

**Current logic**: Only checks if IDs exist
```javascript
const isNewPhotos = initialPhotos.length !== prevInitialPhotosRef.current.length ||
  initialPhotos.some(p => !prevIds.has(p.id)) ||
  prevInitialPhotosRef.current.some(p => !currentIds.has(p.id))
```

**New logic**: Also checks if timestamps changed
```javascript
// Compare by IDs first
const isNewPhotos = initialPhotos.length !== prevInitialPhotosRef.current.length ||
  initialPhotos.some(p => !prevIds.has(p.id)) ||
  prevInitialPhotosRef.current.some(p => !currentIds.has(p.id))

// Also check if any photo's timestamp changed (indicating reorder)
if (!isNewPhotos) {
  const prevMap = new Map(prevInitialPhotosRef.current.map(p => [p.id, p.updatedAt]))
  isNewPhotos = initialPhotos.some(p => {
    const prevTs = prevMap.get(p.id)
    return prevTs && prevTs !== p.updatedAt
  })
}
```

### Decision 3: Add `updatedAt` to `feedForWave` for consistency

Update the GraphQL query in `src/screens/WaveDetail/reducer.js` to include `updatedAt`:

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

## Implementation Tasks

1. **Update `listWaves` GraphQL query** in `src/screens/Waves/reducer.js`
   - Add `updatedAt` to `photos` selection

2. **Update `WavePhotoStrip` comparison logic** in `src/components/WavePhotoStrip/index.js`
   - Modify the `useEffect` that syncs `initialPhotos` to detect timestamp changes
   - Preserve existing ID-based detection for new/removed photos
   - Add timestamp-based detection for reordered photos

3. **Update `feedForWave` GraphQL query** in `src/screens/WaveDetail/reducer.js`
   - Add `updatedAt` to `photos` selection for consistency

4. **Test scenarios**:
   - Add comment to photo in wave detail → verify wave card updates order
   - Delete comment from photo in wave detail → verify wave card updates order
   - Upload new photo to wave → verify wave card shows newest first
   - Pull refresh on WavesHub → verify fresh data with correct order

## Risks / Trade-offs

- **Schema change**: Adding `updatedAt` field to existing queries (minimal impact, just more data)
- **Performance**: Negligible - `updatedAt` is already fetched by `feedForWave`, just missing from `listWaves`
- **Cache behavior**: Apollo's `network-only` fetch policy ensures fresh data; no cache invalidation changes needed

## Open Questions

None.
