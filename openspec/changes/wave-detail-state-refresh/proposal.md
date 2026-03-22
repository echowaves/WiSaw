## Why

Wave screens have stale-state bugs: renaming a wave doesn't update the header title, navigating back to the wave list shows old names and photo counts, photos removed from a wave remain visible in WaveDetail, and the ungrouped-photos badge doesn't reflect manual removals. All stem from wave state being component-local with no refresh mechanism on screen focus.

## What Changes

- Add `router.setParams({ waveName })` after a successful wave rename so the header title updates immediately
- Add `useFocusEffect` to WavesHub to refresh the wave list from the API every time the screen gains focus
- Add `useFocusEffect` to the waves index screen to refresh the ungrouped photo count on focus
- Add `useFocusEffect` to WaveDetail to re-fetch wave photos from the API when the screen regains focus, clearing stale photos that were deleted or removed from the wave

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `wave-detail`: Add focus-based photo refresh and immediate header title update after rename
- `wave-hub`: Add focus-based wave list refresh so names, photo counts, and thumbnails are current

## Impact

- `src/screens/WaveDetail/index.js` — useFocusEffect for photo refresh, router.setParams in handleSaveEdit
- `src/screens/WavesHub/index.js` — useFocusEffect for wave list refresh
- `app/(drawer)/waves/index.tsx` — useFocusEffect for ungrouped count refresh
- No new dependencies, no API changes, no breaking changes
