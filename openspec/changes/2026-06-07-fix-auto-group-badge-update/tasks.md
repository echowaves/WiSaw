# Tasks: Fix Auto-Group Badge Update After Post-Upload

## Phase 1: Core Event Bus Changes

### Task 1.1: Update autoGroupBus.js
- [x] Modify `emitAutoGroup` to accept optional `silent` parameter (default `false`)
- [x] Add `emitAutoGroupSilent(count, groupingLevel)` helper that calls `emitAutoGroup(count, groupingLevel, true)`
- [x] Ensure the `silent` parameter is passed through to subscribers

**Files**: `src/events/autoGroupBus.js`

**Acceptance**:
- `emitAutoGroupSilent(42, 'CITY')` emits event with `silent: true`
- Subscribers receive `silent` parameter

---

## Phase 2: Photo Upload Service Changes

### Task 2.1: Modify flushUngroupedPhotos to Return Progress
- [x] Change return type from `Promise<boolean>` to `Promise<false | { wavesCreated: number, photosGrouped: number, photosRemaining: number }>`
- [x] Track and return `totalWavesCreated` from the loop
- [x] Return `result.photosRemaining` from the final API response
- [x] Ensure `totalPhotosGrouped` is accumulated correctly

**Files**: `src/screens/PhotosList/upload/photoUploadService.js`

**Acceptance**:
- Function returns progress object on success instead of `true`
- Progress object contains waves created, photos grouped, and remaining count

### Task 2.2: Add Completion Event Emission
- [x] Import `emitAutoGroupDone` from `autoGroupBus`
- [x] Call `emitAutoGroupDone()` after the auto-group loop completes successfully
- [x] Ensure it's called even if `totalWavesCreated === 0` (badge still needs update)

**Files**: `src/screens/PhotosList/upload/photoUploadService.js`

**Acceptance**:
- `emitAutoGroupDone()` is called after loop finishes
- Subscribers (WavesHub) receive the event and refresh counts

---

## Phase 3: Photo Uploader Integration

### Task 3.1: Update usePhotoUploader to Trigger Silent Auto-Group
- [x] Import `emitAutoGroupSilent` from `autoGroupBus`
- [x] After `flushUngroupedPhotos()` completes successfully, call `emitAutoGroupSilent(result.photosGrouped, _groupingState.groupingLevel)`
- [x] Handle the case where `flushUngroupedPhotos` returns `false` (error/nothing to flush)

**Files**: `src/screens/PhotosList/upload/usePhotoUploader.js`

**Acceptance**:
- Silent auto-group is triggered after post-upload flush
- No confirmation dialog appears
- Progress overlay shows if on Waves screen

---

## Phase 4: WavesHub Integration

### Task 4.1: Extract Auto-Group Logic into Helper
- [x] Create `runAutoGroup(count, groupingLevel)` function
- [x] Move the auto-group loop logic from `handleAutoGroup` into `runAutoGroup`
- [x] Extract the progress modal display logic into `runAutoGroup`
- [x] Extract the success/error toast logic into `runAutoGroup`

**Files**: `src/screens/WavesHub/index.js`

**Acceptance**:
- `runAutoGroup` contains all auto-group logic
- Can be called from both manual and automatic triggers

### Task 4.2: Add Silent Mode to handleAutoGroup
- [x] Update `handleAutoGroup(count, eventGroupingLevel, silent = false)` signature
- [x] If `silent === true`, skip the `Alert.alert` confirmation and call `runAutoGroup` directly
- [x] If `silent === false`, show confirmation dialog (existing behavior)

**Files**: `src/screens/WavesHub/index.js`

**Acceptance**:
- Silent mode bypasses confirmation dialog
- Manual mode still shows confirmation dialog

### Task 4.3: Update Toast Logic to Support Silent Mode
- [x] Modify the success toast in `runAutoGroup` to only show when `silent === false`
- [x] If `silent === true`, do not show any toast after completion
- [x] Error toast should still show regardless of silent mode

**Files**: `src/screens/WavesHub/index.js`

**Acceptance**:
- Silent auto-group completes without toast
- Manual auto-group shows success toast when waves created

### Task 4.4: Update Event Listener to Pass Silent Parameter
- [x] Modify the `subscribeToAutoGroup` listener in `useEffect`
- [x] Pass `silent` parameter to `handleAutoGroup(count, eventGroupingLevel, silent)`

**Files**: `src/screens/WavesHub/index.js`

**Acceptance**:
- Listener receives `silent` parameter from event
- Correctly routes to silent or manual mode

---

## Phase 5: Testing and Validation

### Task 5.1: Test Manual Auto-Group (Existing Behavior)
- [ ] Navigate to Waves screen
- [ ] Tap auto-group button
- [ ] Verify confirmation dialog appears
- [ ] Confirm and verify progress overlay shows
- [ ] Verify success toast appears
- [ ] Verify badge updates
- [ ] Verify waves list refreshes

### Task 5.2: Test Post-Upload Auto-Group (New Behavior)
- [ ] Have ungrouped photos
- [ ] Upload a new photo
- [ ] Wait for 5-second delay
- [ ] Verify progress overlay shows (if on Waves screen)
- [ ] Verify NO confirmation dialog
- [ ] Verify NO success toast
- [ ] Verify badge updates on PhotosList header
- [ ] Verify badge updates on Waves drawer icon
- [ ] Verify waves list refreshes

### Task 5.3: Test Badge Updates from Multiple Sources
- [ ] Upload multiple batches of photos
- [ ] Verify badge updates after each batch
- [ ] Navigate between screens during post-upload
- [ ] Verify badge updates even when not on Waves screen

### Task 5.4: Test Edge Cases
- [ ] Upload with no ungrouped photos
- [ ] Verify no progress overlay appears
- [ ] Verify no badge update (count stays 0)
- [ ] Test with grouping level set to different values (CITY, DISTRICT, REGION, COUNTRY)
- [ ] Verify `emitAutoGroupDone` is called regardless of grouping level

---

## Files Modified Summary

| File | Changes |
|------|---------|
| `src/events/autoGroupBus.js` | Add `silent` parameter, `emitAutoGroupSilent` helper |
| `src/screens/PhotosList/upload/photoUploadService.js` | Return progress, emit completion event |
| `src/screens/PhotosList/upload/usePhotoUploader.js` | Trigger silent auto-group after flush |
| `src/screens/WavesHub/index.js` | Add silent mode, extract `runAutoGroup`, update listener |

---

## Estimated Complexity

- **Phase 1**: 2 points (simple event bus update)
- **Phase 2**: 3 points (return value change, event emission)
- **Phase 3**: 2 points (integration, one import)
- **Phase 4**: 5 points (logic extraction, silent mode, toast logic)
- **Phase 5**: 3 points (comprehensive testing)

**Total**: 15 story points
