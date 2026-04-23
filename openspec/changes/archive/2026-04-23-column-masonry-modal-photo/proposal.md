## Why

The current photo feed uses row-based masonry layout with inline photo expansion. When a user taps a thumbnail, a 1200+ line Photo component renders inside the VirtualizedList item, requiring complex dimension calculation pipelines, scroll anchoring hacks, and global callback registries to manage the expansion. This architecture is fragile — dimension corruption requires defensive correction, measured heights drive cascading re-renders, and the expansion state management (`usePhotoExpansion`) accounts for 240+ lines of scroll/anchor/height-tracking code. Switching to column-based masonry with modal photo detail eliminates all inline expansion complexity, produces a more stable grid, and enables the stalled "comments below thumbnail" feature which failed under row mode due to dead space from shared row heights.

## What Changes

- Switch masonry layout from row mode (`layoutMode='row'`) to column mode (`layoutMode='column'`) for all segments, giving each photo its own natural height
- Use the masonry library's native `getExtraHeight` callback to add a fixed-height comment section below thumbnails in the bookmarked segment (segment 1)
- Replace inline photo expansion with a new `/photo-detail` fullScreenModal route that renders the Photo component in its own screen
- Add a Jotai atom (`photoDetailAtom`) to pass photo data and context to the modal
- Remove all inline expansion state management from `ExpandableThumb`, `usePhotoExpansion`, `PhotosListMasonry`, and the four parent screens (PhotosList, BookmarksList, WaveDetail, FriendDetail)
- Remove the `getItemDimensions` callback and dimension correction hack from `PhotosListMasonry` — column mode calculates dimensions from aspect ratios natively
- Switch `expo-masonry-layout` dependency to local filesystem path (`file:../expo-masonry-layout`) for development iteration
- Configure Metro to watch the local masonry layout package via `watchFolders`

## Capabilities

### New Capabilities
- `photo-detail-modal`: Full-screen modal route for viewing photo details, replacing inline expansion in the masonry grid
- `thumb-comment-section`: Below-photo comment section on thumbnails in the bookmarked segment, using masonry layout's native `getExtraHeight` for height allocation

### Modified Capabilities
- `photo-feed`: Feed switches from row-based masonry to column-based masonry layout; photo viewing changes from inline expansion to modal navigation
- `photo-thumb-context-hint`: The ⋮ pill positioning changes since thumbnails no longer expand inline; pill stays on the image portion above the comment section
- `friend-photo-feed`: Switches to column masonry and modal photo detail (same as main feed)
- `wave-detail`: Switches to column masonry and modal photo detail (same as main feed)
- `starred-screen`: Bookmarks screen switches to column masonry, gains comment sections below thumbnails, uses modal for photo detail

## Impact

- **Code**: `ExpandableThumb` reduced from ~500 to ~150 lines. `usePhotoExpansion` hook eliminated or reduced to scroll-management-only (~40 lines). `PhotosListMasonry` simplified (no dimension correction, no expansion props). Four parent screens (PhotosList, BookmarksList, WaveDetail, FriendDetail) lose ~15 expansion-related prop wiring each.
- **New files**: `app/photo-detail.tsx` (modal route), atom addition in `src/state.js`
- **Dependencies**: `expo-masonry-layout` switched to `file:../expo-masonry-layout` (local dev); `metro.config.js` already updated with `watchFolders`
- **UX**: Photo tap navigates to a full-screen modal instead of inline expansion. Grid scroll position preserved under the modal. Bookmarked thumbnails show last comment + stats below the image.
- **Photo component**: Close button already falls back to `router.back()` when `global.expandableThumbMinimize` is not set — works in modal context without changes. `removePhoto` context provided via `PhotosListContext.Provider` wrapper in the modal route.
