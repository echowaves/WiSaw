# Why

When auto-grouping completes (either manually triggered via WavesHub or automatically after photo upload), the badge indicator on the photo list header's WaveHeaderIcon component does not update to reflect the new ungrouped photo count. This leaves users with stale information in the app's main feed.

The issue is that while WavesHub properly subscribes to `emitAutoGroupDone()` to refresh its badge, the WaveHeaderIcon component on the photo feed header only fetches counts once on mount and never refreshes them when the event is emitted.

## What Changes

- Add subscription to `emitAutoGroupDone()` in WaveHeaderIcon component
- After receiving the event, WaveHeaderIcon will re-fetch `wavesCount`, `ungroupedPhotosCount`, and `bookmarksCount` from the server
- This ensures the badge updates immediately when auto-grouping completes, whether triggered manually or automatically
- The same event system that WavesHub uses will also refresh the header badge

## Capabilities

### Modified Capabilities

- `auto-group-photos`: Badge updates now trigger across multiple screens (WavesHub, photo feed header) when auto-grouping completes
- `waves-header-badge`: Badge on photo feed header now stays fresh without requiring navigation

## Impact

- **Files modified**: `src/components/WaveHeaderIcon/index.js` — Add `subscribeToAutoGroupDone` subscription to refresh counts
- **Behavior change**: Badge on photo feed header updates immediately after auto-group completes (manual or automatic)
- **User experience**: Users see accurate ungrouped photo count in both WavesHub and photo feed header without navigation
