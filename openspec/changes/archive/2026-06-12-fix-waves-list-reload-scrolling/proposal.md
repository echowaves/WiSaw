## Why

When reloading the waves list screen (e.g., after uploading a photo or completing auto-grouping), the photos in individual wave cards scroll to the right unexpectedly. This only happens on reload—not the initial load—because the `userHasScrolled` ref in `WavePhotoStrip` persists across re-renders and incorrectly triggers auto-scroll behavior.

## What Changes

- **Fix**: Reset `userHasScrolled.current` and `autoScrollTrigger` state when `initialPhotos` prop changes in `WavePhotoStrip`
- **Fix**: Ensure FlatList starts at scroll position 0 when receiving new initial photos
- **Behavior**: Wave photo strips will always start at the left edge when new data arrives, regardless of previous scroll state

### Capabilities

### Modified Capabilities
- `wave-photo-strip`: Fix implementation to properly reset scroll state when `initialPhotos` prop updates. The current requirement allows auto-scroll after pagination, but doesn't account for the edge case where the component re-renders with new data (e.g., parent refreshes waves list). This change adds a constraint: scroll state must be reset to initial conditions when new photos are provided.

## Impact

- **Affected**: `/src/components/WavePhotoStrip/index.js`
- **Components**: `WavePhotoStrip` (used by `WaveCard`, `UngroupedPhotosCard`, `FriendCard`)
- **Behavior**: When parent components refresh their data (e.g., waves list reload), all wave photo strips will reset to scroll position 0 instead of maintaining or jumping to previously scrolled positions
- **Breaking**: None—this fixes a bug without changing user-facing behavior for normal workflows
