## Why

Three UX issues in the photo feed create confusion and friction: (1) the scroll-to-top FOB overlaps the expanded photo's collapse button since both sit in the top-right corner, (2) both use the same chevron-up icon making them visually indistinguishable, and (3) the search bar's close button only appears when text has been entered, leaving no way to dismiss an empty search.

## What Changes

- Move the ScrollToTopFob from top-right to top-left, animating in from the left edge instead of the right
- Change the expanded photo's collapse button icon from `chevron-up` to `close` (X), matching the app's existing dismiss pattern used by `CloseButton` and `QuickActionsModal`
- Show the SearchFab's clear/dismiss button whenever the search bar is expanded, not only when text is present

## Capabilities

### New Capabilities
_None_

### Modified Capabilities
- `scroll-to-top-fob`: Position changes from top-right to top-left; animation direction reverses (slides in from left, dismisses to left)
- `inline-expand`: Collapse button icon changes from `chevron-up` to `close`
- `search-fab`: Clear button visibility changes from text-dependent to always-visible when expanded

## Impact

- **Modified files**: `src/components/ScrollToTopFob/index.js` (position, animation), `src/screens/PhotosList/components/PhotosListMasonry.js` (collapse button icon), `src/components/SearchFab/index.js` (clear button condition)
- **All masonry screens affected**: PhotosList, BookmarksList, FriendDetail, WaveDetail — all share these components
- **Risk**: Low — visual/behavioral changes only, no data or state management impact
