## Why

When a user taps a photo thumbnail to expand it in the main feed (PhotosList), the screen automatically scrolls so the expanded photo is visible from its top edge. In Wave Detail, the same expansion happens but without any scroll — the user must manually scroll to see the full expanded photo. This inconsistency is confusing since both screens use the same masonry component and ExpandableThumb.

## What Changes

- Replace WaveDetail's manual photo expansion state management with the shared `usePhotoExpansion` hook already used by PhotosList
- Wire up the missing `onRequestEnsureVisible` and `onScroll` props to PhotosListMasonry in WaveDetail
- Remove duplicated expansion state code from WaveDetail that the hook now provides

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `wave-detail`: Add scroll-to-expanded-photo behavior — when a photo expands inline, the view SHALL scroll to show the expanded photo from its top edge, matching PhotosList behavior

## Impact

- `src/screens/WaveDetail/index.js` — replace manual expansion state with `usePhotoExpansion` hook, wire scroll props to masonry
- No new dependencies, no API changes, no breaking changes
