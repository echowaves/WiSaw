## Why

After auto grouping completes, the app sometimes freezes temporarily. Users report that waiting longer after auto grouping completes prevents the freeze. The freeze only occurs if auto grouping "leaves traces" (incomplete state). Analysis reveals that `emitAutoGroupDone()` is called twice and triggers an expensive `handleRefresh()` that reloads all waves from GraphQL.

## What Changes

- **Single emission**: Remove duplicate `emitAutoGroupDone()` calls in `runAutoGroup()` - keep only in `finally` block
- **Lightweight refresh**: Replace heavy `handleRefresh()` call after auto-group with lightweight ungrouped count badge update
- **Optional debounced waves refresh**: Add optional debounced waves refresh if needed
- **Concurrency guard**: Ensure `flushUngroupedPhotos()` respects `autoGroupRunningRef` guard
- **Backend error handling**: Add try-catch to backend `autoGroupPhotosIntoWaves` to ensure advisory lock is always released

## Capabilities

### New Capabilities
- `auto-group-light-refresh`: After auto-group completes, only refresh ungrouped count badge instead of reloading all waves

### Modified Capabilities
- None

## Impact

**Affected Files:**
- `src/screens/WavesHub/index.js` - Remove duplicate emission, replace handleRefresh with lightweight update
- `src/screens/WavesHub/reducer.js` - No changes needed
- `src/screens/PhotosList/upload/photoUploadService.js` - Add concurrency guard
- `lambda-fns/controllers/waves/autoGroupPhotosIntoWaves.ts` - Add error handling for advisory lock

**API Changes:** None

**Breaking Changes:** None
