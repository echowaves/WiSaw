## Context

The auto-group feature currently has two distinct entry points:

1. **Manual trigger**: User taps "Auto-Group" button in WavesHub → shows confirmation alert → runs auto-group → emits `emitAutoGroupDone()` → badge updates
2. **Automatic trigger (post-upload)**: `flushUngroupedPhotos()` → runs auto-group → updates atoms → NO `emitAutoGroupDone()` → badge stale

The badge on WaveHeaderIcon and Waves drawer icon is controlled by:
- `wavesCount` atom → coral if waves exist, grey otherwise
- `ungroupedPhotosCount` atom → red dot badge if > 0

The WavesHub screen subscribes to `emitAutoGroupDone()` to call `fetchCounts()` which refreshes these atoms. The post-upload path never emits this event.

The current `flushUngroupedPhotos()` function:
- Returns `true/false` (success indicator)
- Calls `autoGroupPhotosIntoWaves` in a loop
- Updates local Jotai atoms via the mutation response
- But never signals completion to listeners

## Design Decisions

### 1. Return Progress Info from flushUngroupedPhotos()

**Current**: Returns `boolean` (success/failure)

**Change**: Return progress object on success:
```javascript
{
  wavesCreated: number,
  photosGrouped: number,
  photosRemaining: number
}
```

**Why**: This allows the caller (usePhotoUploader) to know how many waves were created and photos grouped, which is needed to trigger the progress UI.

### 2. Emit Completion Event

**Change**: After `flushUngroupedPhotos()` completes its auto-group loop, call `emitAutoGroupDone()`.

**Why**: This signals completion to subscribers (WavesHub's `fetchCounts()` effect), which updates the badge atoms.

### 3. Silent Mode for Auto-Group Trigger

**Problem**: If we simply call `emitAutoGroup()` after post-upload, the confirmation dialog will appear even though the user didn't explicitly tap the button.

**Solution**: Add a `silent` parameter to `emitAutoGroup()`:
- `emitAutoGroup(count, groupingLevel, silent = false)` — default behavior (shows alert)
- `emitAutoGroupSilent(count, groupingLevel)` — silent mode (skips alert)

**Why**: Post-upload auto-grouping is automatic and shouldn't interrupt the user with confirmation dialogs. Manual button taps should still show the alert.

### 4. WavesHub Auto-Group Handler Updates

**Current**: `handleAutoGroup(count, eventGroupingLevel)` shows confirmation dialog, then runs auto-group

**Change**: `handleAutoGroup(count, eventGroupingLevel, silent = false)`
- If `silent === true`: Skip confirmation dialog, run auto-group directly
- If `silent === false`: Show confirmation dialog (existing behavior)

**Extract `runAutoGroup()`**: Move the auto-group logic into a helper function to avoid code duplication.

### 5. Progress UI for Automatic Triggers

**Requirement**: When auto-group is triggered automatically while on the Waves screen, it should show the same feedback as manual button.

**Implementation**:
- `emitAutoGroupSilent()` → WavesHub's listener → `handleAutoGroup(silent=true)` → `runAutoGroup()` → shows progress overlay
- The progress overlay is already in WavesHub and works the same regardless of how auto-group was triggered
- After completion, badge updates via `emitAutoGroupDone()`

### 6. No Toast for Automatic Triggers

**Requirement**: User explicitly said "no toast in this case"

**Implementation**: The `runAutoGroup()` function shows a success toast only when `totalWavesCreated > 0`. We need to modify this to NOT show toast when `silent === true`.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    POST-UPLOAD AUTO-GROUP FLOW                          │
└─────────────────────────────────────────────────────────────────────────┘

Photo Upload Complete
         │
         ▼
┌──────────────────────┐
│ usePhotoUploader     │
│  - 5s delay          │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ flushUngroupedPhotos │
│  - Run auto-group    │
│  - Track progress    │
│  - Emit emitAutoGroupDone()  │
└──────────┬───────────┘
           │
           ├───────────▶ Badge Update (via emitAutoGroupDone → fetchCounts)
           │
           ▼
┌──────────────────────┐
│ Return progress      │
│ { wavesCreated,      │
│   photosGrouped,     │
│   photosRemaining }  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ emitAutoGroupSilent  │
│ (skips confirmation) │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ WavesHub listener    │
│ handleAutoGroup      │
│ (silent=true)        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ runAutoGroup()       │
│ - Show progress modal │
│ - Loop auto-group    │
│ - Update atoms       │
│ - No toast (silent)  │
│ - Emit done          │
└──────────┬───────────┘
           │
           ├───────────▶ Badge Update (again, via emitAutoGroupDone)
           │
           ▼
┌──────────────────────┐
│ Waves list refresh   │
│ (via handleRefresh)  │
└──────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                    MANUAL AUTO-GROUP FLOW (UNCHANGED)                   │
└─────────────────────────────────────────────────────────────────────────┘

User Taps Auto-Group Button
         │
         ▼
┌──────────────────────┐
│ handleAutoGroup      │
│ (silent=false)       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Alert.alert()        │
│ (confirmation)       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ runAutoGroup()       │
│ - Show progress modal │
│ - Loop auto-group    │
│ - Show success toast │
│ - Emit done          │
└──────────┬───────────┘
           │
           ├───────────▶ Badge Update
           │
           ▼
┌──────────────────────┐
│ Waves list refresh   │
└──────────────────────┘
```

## Files to Modify

### 1. `src/events/autoGroupBus.js`

**Add**:
- `emitAutoGroupSilent(count, groupingLevel)` function
- Update `emitAutoGroup` signature to include `silent` parameter

### 2. `src/screens/PhotosList/upload/photoUploadService.js`

**Modify `flushUngroupedPhotos`**:
```javascript
// Return progress object instead of boolean
return {
  wavesCreated: totalWavesCreated,
  photosGrouped: totalPhotosGrouped,
  photosRemaining: result?.photosRemaining ?? 0
}
```

**Add**:
```javascript
import { emitAutoGroupDone } from '../../../events/autoGroupBus'

// After the loop, before returning:
emitAutoGroupDone()
```

### 3. `src/screens/PhotosList/upload/usePhotoUploader.js`

**Modify post-upload auto-group call**:
```javascript
const result = await flushUngroupedPhotos(activeUuid)
if (result && result !== false) {
  emitAutoGroupSilent(result.photosGrouped, _groupingState.groupingLevel)
}
```

**Add import**:
```javascript
import { emitAutoGroupSilent } from '../../../events/autoGroupBus'
```

### 4. `src/screens/WavesHub/index.js`

**Modify `handleAutoGroup` signature**:
```javascript
const handleAutoGroup = useCallback((count, eventGroupingLevel, silent = false) => {
  // If silent, skip alert and run directly
  if (silent) {
    runAutoGroup(count, gl)
    return
  }
  // Otherwise show confirmation dialog (existing logic)
})
```

**Extract `runAutoGroup` helper**:
```javascript
const runAutoGroup = useCallback(async (count, gl) => {
  // Move the auto-group logic here
  // Show toast only if not silent
  // Emit emitAutoGroupDone() at the end
}, [dependencies])
```

**Update `useEffect` listener**:
```javascript
useEffect(() => {
  const unsubscribe = subscribeToAutoGroup((count, eventGroupingLevel, silent) => {
    handleAutoGroup(count, eventGroupingLevel, silent)
  })
  return unsubscribe
}, [handleAutoGroup])
```

**Add import**:
```javascript
import { emitAutoGroupSilent } from '../../../events/autoGroupBus'
```
