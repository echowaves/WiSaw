## 1. Code Changes

- [x] 1.1 Update `subscribeToAutoGroupDone` listener to call `handleRefresh()` instead of `fetchCounts()`
- [x] 1.2 Update `subscribeToUploadComplete` listener to call `getUngroupedPhotosCount({ uuid })` only
- [x] 1.3 Remove unused `fetchCounts()` function
- [x] 1.4 Remove unused `getWavesCount` import
- [x] 1.5 Remove unused `setWavesCount` variable and `useSetAtom` import
- [x] 1.6 Verify lint passes (`npx ts-standard src/screens/WavesHub/index.js`)

## 2. Manual Testing

- [ ] 2.1 Upload a photo → verify ungrouped count badge increments
- [ ] 2.2 Upload a photo → verify waves list does NOT reload (no spinner flash)
- [ ] 2.3 Trigger auto-group → verify waves list refreshes (brief spinner)
- [ ] 2.4 After auto-group → verify newly grouped photos appear in correct waves
- [ ] 2.5 After auto-group → verify ungrouped count badge updates correctly
- [ ] 2.6 Verify no duplicate refreshes when auto-group completes multiple times rapidly

## 3. Documentation

- [ ] 3.1 Update main `wave-hub/spec.md` when archiving (delta spec will sync automatically)
