## 1. Export grouping state for non-React code access

- [x] 1.1 Add `export { _groupingState }` to `src/utils/groupingAtom.js` so the upload service can read `_groupingState.enabled` synchronously without Jotai hooks

## 2. Gate batch flush behind enabled flag

- [x] 2.1 Import `_groupingState` in `src/screens/PhotosList/upload/photoUploadService.js`
- [x] 2.2 Add guard at the top of `flushUngroupedPhotos()`: return false early if `_groupingState.enabled === false`

## 3. Gate per-photo wave assignment behind enabled flag

- [x] 3.1 In `processCompleteUpload()`, wrap the `checkAndAssignWave()` call with a guard: only execute when `_groupingState.enabled === true`
- [x] 3.2 When disabled, leave `assignedWaveUuid` as null so the photo is enqueued without wave assignment

## 4. Verify behavior

- [x] 4.1 Test that uploading photos with grouping disabled results in ungrouped photos appearing in UngroupedPhotosCard
- [x] 4.2 Test that re-enabling grouping restores both batch flush and per-photo wave assignment behavior
