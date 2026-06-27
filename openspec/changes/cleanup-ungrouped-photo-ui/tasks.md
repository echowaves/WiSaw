## 1. WavesHub Cleanup

- [x] 1.1 Remove `UngroupedPhotosCard` import from WavesHub
- [x] 1.2 Remove `getUngroupedPhotosCount` import from Waves/reducer in WavesHub
- [x] 1.3 Set `ListHeaderComponent={null}` in FlatList (remove UngroupedPhotosCard conditional)
- [x] 1.4 Remove numeric badge from kebab menu header button (keep menu button without badge)
- [x] 1.5 Remove `getUngroupedPhotosCount` call from upload complete subscription handler
- [x] 1.6 Remove `getUngroupedPhotosCount` call from autoGroupDone subscription handler

## 2. WavesExplainerView Messaging Update

- [x] 2.1 Update subtitle text to "Your first photos will be automatically organized into a new wave."
- [x] 2.2 Update camera card body to emphasize automatic wave placement
- [x] 2.3 Remove the "Two Ways to Add Photos" card from NO_PHOTOS_CARDS
- [x] 2.4 Update button text to not reference "Refresh Waves (N ungrouped)" variant

## 3. WaveHeaderIcon Cleanup

- [x] 3.1 Remove `getUngroupedPhotosCount` from initial load Promise.all
- [x] 3.2 Remove `setUngroupedPhotosCount` from initial load callback
- [x] 3.3 Remove entire `subscribeToAutoGroupDone` effect that fetches ungrouped count
- [x] 3.4 Remove badge display from WaveHeaderIcon entirely
- [x] 3.5 Clean up unused imports and styles

## 4. Drawer Icon Cleanup

- [x] 4.1 Update `WavesDrawerIcon` to remove badge and ungrouped count dependency
- [x] 4.2 Remove `ungroupedCount` from the activity check in WavesDrawerIcon
- [x] 4.3 Remove `showBadge` logic from WavesDrawerIcon

## 5. Verification

- [x] 5.1 Verify no remaining imports of `UngroupedPhotosCard` component
- [x] 5.2 Verify no remaining calls to `getUngroupedPhotosCount` in UI components
- [x] 5.3 Verify WavesHub shows clean empty state when no waves exist
- [x] 5.4 Verify drawer waves icon no longer has badges