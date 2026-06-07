## Why

When photos are uploaded, the system automatically calls `flushUngroupedPhotos` to group any pending ungrouped photos into waves. However, after this automatic post-upload auto-grouping completes, the wave badge indicator on the PhotosList header (and Waves drawer icon) does not update to reflect the new state.

The issue is that `flushUngroupedPhotos` calls `autoGroupPhotosIntoWaves` in a loop and updates the Jotai atoms (`ungroupedPhotosCount`, `wavesCount`), but it does NOT emit `emitAutoGroupDone()`. The WavesHub screen subscribes to `emitAutoGroupDone` to call `fetchCounts()` which refreshes these atoms. Since the event is never emitted, the badge stays stale.

Additionally, when auto-grouping is triggered automatically after upload while the user is on the Waves screen, it should show the same feedback as if the auto-group button was tapped explicitly (progress overlay with waves created, photos processed).

## What Changes

- Modify `flushUngroupedPhotos()` to return progress info (wavesCreated, photosGrouped, photosRemaining) instead of just boolean
- Modify `flushUngroupedPhotos()` to emit `emitAutoGroupDone()` after completion to trigger badge updates
- Add a "silent mode" to the auto-group trigger mechanism that bypasses the confirmation dialog
- When post-upload auto-group completes, trigger WavesHub's auto-group handler in silent mode
- In silent mode, WavesHub shows the progress overlay but skips the confirmation dialog
- After completion, badge updates, waves list refreshes, but NO toast notification is shown (silent operation)

## Capabilities

### New Capabilities

- `auto-group-silent-mode`: Post-upload auto-grouping can trigger the same UI feedback as manual button tap, but without user confirmation

### Modified Capabilities

- `auto-group-photos`: The "progress feedback" requirement now includes:
  - Progress overlay shown for both manual and automatic triggers
  - Progress updates during the loop (photos grouped, waves created, remaining)
  - Badge updates after completion
  - No toast after automatic triggers

## Impact

- **Files modified**: 
  - `src/events/autoGroupBus.js` — Add silent mode to emitAutoGroup
  - `src/screens/PhotosList/upload/photoUploadService.js` — Return progress info, emit completion
  - `src/screens/PhotosList/upload/usePhotoUploader.js` — Trigger silent auto-group after post-upload flush
  - `src/screens/WavesHub/index.js` — Add silent mode to handleAutoGroup
- **Behavior change**: Badge updates after post-upload auto-grouping; progress shown if on Waves screen
- **User experience**: Badge no longer stale after auto-grouping; same feedback as manual button
