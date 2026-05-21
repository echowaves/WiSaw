## Why

When users disable auto-grouping in Grouping Settings, photos uploaded to WiSaw still get assigned to waves automatically. The `enabled` flag is respected for the location-drift auto-trigger in WavesHub, but not for the two wave-assignment mechanisms that run during upload: batch flushing of ungrouped photos and per-photo wave assignment via drift check.

## What Changes

- Gate `flushUngroupedPhotos()` behind `_groupingState.enabled` — skip batch grouping when disabled
- Gate `checkAndAssignWave()` call in `processCompleteUpload()` behind `_groupingState.enabled` — skip per-photo wave assignment when disabled
- When grouping is disabled, uploaded photos remain ungrouped (no `waveUuid`) and accumulate in the UngroupedPhotosCard for manual grouping later

## Capabilities

### New Capabilities

None. This change modifies existing behavior without introducing new capabilities.

### Modified Capabilities

- `upload-wave-assignment`: When `enabled` is false, wave assignment during upload (both flush and per-photo) SHALL be skipped; photos remain ungrouped
- `auto-group-settings`: The `enabled` flag now controls all client-side grouping operations including upload-time wave assignment, not just the WavesHub auto-trigger

## Impact

- `src/screens/PhotosList/upload/photoUploadService.js` — add guards in `flushUngroupedPhotos()` and `processCompleteUpload()`
- `src/utils/groupingAtom.js` — export `_groupingState` for non-React code access
- Delta specs needed for `upload-wave-assignment` and `auto-group-settings`
