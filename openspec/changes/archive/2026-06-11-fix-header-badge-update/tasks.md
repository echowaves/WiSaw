# Tasks: Fix WaveHeaderIcon Badge Update After Auto-Group

**Status**: ✅ Implementation Complete
- WaveHeaderIcon now subscribes to `emitAutoGroupDone()` event
- Badge automatically updates after auto-group completes (manual or automatic)
- Follows same pattern as WavesHub implementation

## Phase 1: WaveHeaderIcon Subscription

### Task 1.1: Import Event Bus Function
- [x] Import `subscribeToAutoGroupDone` from `src/events/autoGroupBus.js`
- [x] Ensure the import is placed with other imports from `autoGroupBus`

**Files**: `src/components/WaveHeaderIcon/index.js`

**Implementation**: Line 11
```javascript
import { subscribeToAutoGroupDone } from '../../../events/autoGroupBus'
```

**Acceptance**:
- Import statement is present at top of file
- Follows existing import patterns in the component

### Task 1.2: Add Event Subscription Effect
- [x] Add `useEffect` hook after the initial mount effect (around line 20-35)
- [x] Subscribe to `subscribeToAutoGroupDone` and re-fetch counts
- [x] Return unsubscribe function for cleanup

**Files**: `src/components/WaveHeaderIcon/index.js`

**Implementation**: Lines 39-54
```javascript
// Subscribe to auto-group completion event to refresh badge
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

**Acceptance**:
- Effect runs when `emitAutoGroupDone()` is emitted
- Fetches all three counts in parallel (`getWavesCount`, `getUngroupedPhotosCount`, `getBookmarksCount`)
- Sets atoms with fresh data from server

### Task 1.3: Verify Dependency Array
- [x] Include `uuid` in dependency array (needed for fetch)
- [x] Include setter functions (`setWavesCount`, `setUngroupedPhotosCount`, `setBookmarksCount`) to avoid stale closures

**Files**: `src/components/WaveHeaderIcon/index.js`

**Acceptance**:
- Effect re-subscribes if any dependency changes (unlikely but safe)
- No lint warnings about missing dependencies

---

## Phase 2: Verification

### Task 2.1: Manual Auto-Group Test
- [ ] Navigate to photo feed with some ungrouped photos
- [ ] Note badge count on header
- [ ] Navigate to Waves screen
- [ ] Tap "Auto-Group" button in WavesHub
- [ ] Complete auto-group operation
- [ ] Return to photo feed
- [ ] **Expected**: Badge count updates to reflect new state

### Task 2.2: Automatic Post-Upload Test
- [ ] Enable auto-group in settings
- [ ] Upload a photo while ungrouped photos exist
- [ ] Wait for auto-group to trigger after 5s delay
- [ ] Check photo feed header
- [ ] **Expected**: Badge updates without requiring navigation

### Task 2.3: Wave Deletion Test
- [ ] Create a wave and delete it
- [ ] Verify badge updates after deletion (WavesHub emits `emitAutoGroupDone()` after delete)
- [ ] **Expected**: Badge reflects new ungrouped count (photos returned to ungrouped pool)

### Task 2.4: Multiple Subscribers Test
- [ ] Have both WavesHub and photo feed open (or switch between them)
- [ ] Trigger auto-group
- [ ] Verify both screens update their badges
- [ ] **Expected**: Both WaveHeaderIcon and WavesHub badge refresh

---

## Implementation Notes

### Reusing Existing Fetch Logic

The initial mount effect already has the fetch logic. The new effect should duplicate this logic exactly:

```javascript
// Existing (initial mount)
useEffect(() => {
  if (wavesCount !== null || !uuid) return
  // ... fetch logic
}, [wavesCount, uuid])

// New (event-driven refresh)
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

### Why Not Use the Same Effect?

The initial mount effect has `if (wavesCount !== null || !uuid) return` which prevents re-fetching if counts are already loaded. The event-driven effect should NOT have this guard because:
1. We want to refresh counts even when they're already loaded
2. The event is only emitted when we KNOW counts have changed (auto-group completed)
3. The guard would defeat the purpose of the event subscription
