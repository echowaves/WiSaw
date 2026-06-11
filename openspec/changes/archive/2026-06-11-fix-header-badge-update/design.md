## Context

The `WaveHeaderIcon` component in `src/components/WaveHeaderIcon/index.js` displays the wave icon in the upper-right corner of the photo feed header. It shows:
- Coral color (`CONST.MAIN_COLOR`) when waves exist or ungrouped photos > 0
- Grey color (`theme.TEXT_SECONDARY`) when no activity
- Red dot badge when `ungroupedPhotosCount > 0`

The component reads from three Jotai atoms:
- `STATE.wavesCount` — number of waves user has created
- `STATE.ungroupedPhotosCount` — number of ungrouped photos awaiting organization
- `STATE.bookmarksCount` — number of bookmarked photos

Currently, WaveHeaderIcon fetches these counts once on mount when `wavesCount === null`:

```javascript
useEffect(() => {
  if (wavesCount !== null || !uuid) return
  let cancelled = false
  Promise.all([
    getWavesCount({ uuid }),
    getUngroupedPhotosCount({ uuid }),
    getBookmarksCount({ uuid })
  ]).then(([wc, uc, bc]) => {
    if (cancelled) return
    setWavesCount(wc)
    setUngroupedPhotosCount(uc)
    setBookmarksCount(bc)
  }).catch(err => console.error('WaveHeaderIcon fetch:', err))
  return () => { cancelled = true }
}, [wavesCount, uuid])
```

After this initial fetch, the atoms are updated when auto-grouping completes ( WavesHub subscribes to `emitAutoGroupDone()` and calls `fetchCounts()`), but WaveHeaderIcon has no subscription to this event, so it never refreshes its data.

The `emitAutoGroupDone()` event is already emitted from two places:
1. `runAutoGroup()` in WavesHub (after manual auto-group)
2. `flushUngroupedPhotos()` in photoUploadService (after automatic post-upload auto-group)

The WavesHub screen properly listens for this event and refreshes its badge, but WaveHeaderIcon does not.

## Design Decisions

### 1. Add `subscribeToAutoGroupDone` to WaveHeaderIcon

**Change**: Add a `useEffect` hook that subscribes to `emitAutoGroupDone()` and re-fetches all three counts.

```javascript
useEffect(() => {
  const unsubscribeDone = subscribeToAutoGroupDone(() => {
    let cancelled = false
    Promise.all([
      getWavesCount({ uuid }),
      getUngroupedPhotosCount({ uuid }),
      getBookmarksCount({ uuid })
    ]).then(([wc, uc, bc]) => {
      if (cancelled) return
      setWavesCount(wc)
      setUngroupedPhotosCount(uc)
      setBookmarksCount(bc)
    }).catch(err => console.error('WaveHeaderIcon fetch:', err))
    return () => { cancelled = true }
  })
  return unsubscribeDone
}, [uuid, setWavesCount, setUngroupedPhotosCount, setBookmarksCount])
```

**Why**: This ensures WaveHeaderIcon refreshes its badge whenever auto-grouping completes, whether triggered manually or automatically. The same event system used by WavesHub will now also refresh the header badge.

**Trade-offs**:
- **Duplicate fetch logic**: The fetch logic is duplicated from the initial mount effect. This is acceptable because:
  - Both effects serve different purposes (initial load vs. event-driven refresh)
  - The event-driven refresh only needs to run when `emitAutoGroupDone()` fires (relatively rare)
  - Keeping them separate avoids complex state management for "is this the first fetch?"
- **Network calls**: Each `emitAutoGroupDone()` triggers three GraphQL queries. This is acceptable because:
  - The queries are lightweight integer counts, not full data arrays
  - Auto-group completion is infrequent (only when user manually triggers or uploads photos)
  - The alternative (stale badge) is worse for user experience

### 2. Reuse Existing Query Functions

**Decision**: Reuse the existing `getWavesCount`, `getUngroupedPhotosCount`, `getBookmarksCount` functions from `src/screens/Waves/reducer.js`.

**Why**: These functions already exist and are tested. Creating new functions would duplicate logic and increase maintenance burden.

### 3. Import Event Bus Function

**Decision**: Import `subscribeToAutoGroupDone` from `src/events/autoGroupBus.js`.

**Why**: This is the established pattern used throughout the codebase for event-driven updates. It's a simple pub/sub system that works well for this use case.

## Implementation

**Files to Modify**: `src/components/WaveHeaderIcon/index.js`

**Changes**:
1. Import `subscribeToAutoGroupDone` from `src/events/autoGroupBus`
2. Add `useEffect` hook to subscribe to `emitAutoGroupDone()` event
3. Re-fetch all three counts (`wavesCount`, `ungroupedPhotosCount`, `bookmarksCount`) when event fires
4. Return unsubscribe function for cleanup

**Existing Code Already Handles**:
- `WavesHub` already has `subscribeToAutoGroupDone()` subscription (Task 4.4 in existing change)
- `flushUngroupedPhotos()` already calls `emitAutoGroupDone()` (Task 2.2 in existing change)
- `WavesHub` already has `runAutoGroup()` with silent mode (Task 4.1-4.3 in existing change)

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    AUTO-GROUP COMPLETION FLOW                           │
└─────────────────────────────────────────────────────────────────────────┘

autoGroupPhotos() completes
         │
         ▼
┌──────────────────────┐
│ emitAutoGroupDone()  │
│ (WavesHub or         │
│  photoUploadService) │
└──────────┬───────────┘
           │
           ├───────────────────────────────┐
           ▼                               ▼
┌──────────────────────┐      ┌──────────────────────┐
│ WavesHub listener    │      │ WaveHeaderIcon       │
│ fetchCounts()        │      │ re-fetch counts      │
│ - wavesCount         │      │ - wavesCount         │
│ - ungroupedPhotosCount│     │ - ungroupedPhotosCount│
└──────────┬───────────┘      └──────────┬───────────┘
           │                               │
           ▼                               ▼
┌──────────────────────┐      ┌──────────────────────┐
│ Badge updates on     │      │ Badge updates on     │
│ WavesHub screen      │      │ Photo feed header    │
└──────────────────────┘      └──────────────────────┘
                                    │
                                    ▼
                           ┌──────────────────────┐
                           │ Atom updates:          │
                           │ - wavesCount           │
                           │ - ungroupedPhotosCount │
                           └──────────┬───────────┘
                                      │
                                      ▼
                           ┌──────────────────────┐
                           │ Badge updates on       │
                           │ Waves drawer icon      │
                           └──────────────────────┘
```
