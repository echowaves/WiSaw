## Why

After auto-grouping completes, the Waves list does not refresh to show newly grouped photos. A previous fix attempt overcomplicated the logic with manual pagination resets and duplicate count fetches, which was reverted. The simplest fix leverages existing refresh mechanisms: reload the waves list on auto-group completion (which already updates counts internally), and only fetch the ungrouped count badge on upload completion.

## What Changes

- **Auto-group done**: Replace `fetchCounts()` with `handleRefresh()` to reload the waves list, showing newly grouped photos. The `runAutoGroup()` function already sets `setUngroupedPhotosCount(result.photosRemaining)`, so badge counts stay correct.
- **Upload complete**: Replace `fetchCounts()` with `getUngroupedPhotosCount()` only — lightweight badge update without full list reload.
- **Removed**: `fetchCounts()` utility function, unused `getWavesCount` import, `setWavesCount` atom setter, and `useSetAtom` import.

## Capabilities

### New Capabilities
(None)

### Modified Capabilities
- `wave-hub`: Refresh behavior after auto-group and upload completion events

## Impact

- **File modified**: `src/screens/WavesHub/index.js`
- **Removed**: `fetchCounts()` function, `getWavesCount` import, `setWavesCount` variable, `useSetAtom` import
- **No new dependencies** required
- **No API changes** required
