# Task: Remove Client Auto-Grouping

## Summary
Move auto-grouping entirely to the server. Remove all client-side auto-grouping code, configuration screens, and navigation. The client now relies on a GraphQL subscription (`onPhotoUploadComplete`) to be notified when photo upload + auto-grouping is complete, then refreshes the waves feed. Newly uploaded photos appear in the feed only when the subscription notification is received.

## Tasks

### 1. Delete unused files
- [x] Delete `app/grouping-settings.tsx`
- [x] Delete `src/components/GroupingSettings/index.js`
- [x] Delete `src/utils/autoGroupRunningGuard.js`

### 2. Clean up WavesHub
- [x] Remove `subscribeToAutoGroupSilent` import and handler (Task 2.1)
- [x] Remove `handleAutoGroup` function (Task 2.2)
- [x] Remove `groupingAtom` and `groupingLevel` state (Task 2.3)
- [x] Remove `autoGroupPhotos` import from WavesHub reducer (Task 2.4)
- [x] Remove location drift auto-trigger code (Task 2.5-2.6)
- [x] Remove `subscribeToAutoGroupSilent` useEffect (Task 2.7)
- [x] Update WavesExplainerView onEmpty to call handleRefresh instead of handleAutoGroup (Task 2.8)
- [x] Keep `emitAutoGroupDone` for wave deletion flow (still valid) (Task 2.9)

### 3. Clean up photo upload pipeline
- [x] Remove `flushUngroupedPhotos` from `photoUploadService.js` (Task 3.1)
- [x] Remove auto-group call from `usePhotoUploader.js` (Task 3.2)
- [x] Remove `groupingAtom` import from `usePhotoUploader.js` (Task 3.3)
- [x] Remove `autoGroupRunningGuard` import from `photoUploadService.js` (Task 3.4)
- [x] Remove `emitAutoGroupSilent` import from `usePhotoUploader.js` (Task 3.5)

### 4. Clean up reducer
- [x] Remove `autoGroupPhotos` function from `Waves/reducer.js` (Task 4.1)
- [x] Remove `flushUngroupedPhotos` from `PhotosList/upload/photoUploadService.js` (Task 4.2)

### 5. Simplify event bus
- [x] Simplify `autoGroupBus.js` — remove `emitAutoGroupSilent` and `subscribeToAutoGroupSilent` (Task 5.1)
- [x] Keep `emitAutoGroupDone` and `subscribeToAutoGroupDone` for wave deletion (Task 5.2)
- [x] Update documentation in `autoGroupBus.js` (Task 5.3)

### 6. Update UI components
- [x] Update `WavesExplainerView` — remove auto-group button, show info that grouping is automatic (Task 6.1)
- [x] Update `UngroupedPhotosCard` — remove "Auto Group Into Waves" button, show info text (Task 6.2)
- [x] Remove grouping settings link from `WaveSettings` (Task 6.3)