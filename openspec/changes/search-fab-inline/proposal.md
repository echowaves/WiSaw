## Why

The search segment (segment 2) in PhotosList is an underused full-tab mode that requires switching away from the current feed. Replacing it with a floating action button (FAB) that expands into an inline search bar lets users search within any active segment without losing context, reduces the segmented control from 3 tabs to 2, and simplifies the PhotosList component's branching logic.

## What Changes

- Remove the search segment (segment 2) from the segmented control — reduce to Global (0) and Starred (1) only
- Add a floating magnifying glass FAB in the bottom-left corner of the masonry layout, positioned above the footer
- Tapping the FAB expands an inline search input bar that slides left-to-right out of the FAB, overlaying the masonry content
- Search applies to the currently active segment (Global or Starred) — the `searchTerm` is passed to `getPhotos` alongside the current `activeSegment`
- Dismissing search (tapping ✕) clears the term, collapses the bar, and reloads the segment without a search filter
- AI tag clicks and `searchFromUrl` deep links now open the FAB search bar and populate the term instead of switching to segment 2
- Remove `PhotosListSearchBar` component (replaced by the FAB component)
- Remove search-specific empty state and render paths for segment 2

## Capabilities

### New Capabilities

- `search-fab`: Floating action button that expands into an inline search bar, with Reanimated-driven slide animation, applicable to any photo feed segment

### Modified Capabilities

- `photo-feed`: Remove segment 2 (search) from the segmented control; search is now triggered via the FAB overlay on any segment. Remove search bar keyboard handling requirement (replaced by search-fab). Update search-related scenarios to use FAB-based search instead of segment switching.

## Impact

- `src/screens/PhotosList/index.js` — remove segment 2 logic, integrate FAB search state, update `load`/`reload`/`updateIndex`/`submitSearch`, remove `PhotosListSearchBar` usage, update `searchFromUrl` and `photoSearchBus` handlers
- `src/screens/PhotosList/components/PhotosListHeader.js` — remove search segment from `SEGMENT_TITLES` and `SEGMENT_ICONS`
- `src/screens/PhotosList/components/PhotosListSearchBar.js` — delete (replaced by FAB component)
- `src/screens/PhotosList/components/PhotosListEmptyState.js` — remove search-specific empty state case
- New component: `src/components/SearchFab/index.js` — FAB with Reanimated expand/collapse animation
