## Why

The current `column-masonry-modal-photo` change replaced inline expansion with a fullScreenModal route. While this eliminated expansion complexity, it creates a jarring UX — tapping a thumbnail navigates away from the feed entirely. Meanwhile, `expo-masonry-layout` has shipped native inline expand support for column mode (`expandedItemIds`, `getExpandedHeight`, `isExpanded` in `renderItem`). This lets us bring back inline photo detail viewing with zero hand-rolled dimension management, scroll anchoring, or global callback registries — the masonry engine handles waterline flushing, full-width placement, and band virtualization natively.

## What Changes

- Use the masonry layout's `expandedItemIds` prop to manage which photos are expanded inline in the column grid
- Use `getExpandedHeight` callback to compute expanded item height from photo aspect ratio plus fixed UI chrome (action bar, comments preview)
- Render `<Photo embedded={true}>` inside expanded masonry items, using `isExpanded` from `renderItem` to switch between thumbnail and detail views
- Use `onHeightMeasured` to re-trigger layout when async content (comments, photo details) loads and changes the expanded height
- Remove the `/photo-detail` modal route, `photoDetailAtom`, and associated navigation logic
- Restore expansion state management in `usePhotoExpansion` — but now as a thin wrapper around `expandedItemIds` array state instead of the old 240-line scroll/anchor/height tracking
- Update `ExpandableThumb` to pass `isExpanded` through and render `<Photo>` when expanded

## Capabilities

### New Capabilities
- `inline-expand`: Inline photo detail expansion using masonry layout's native `expandedItemIds` / `getExpandedHeight` API, replacing the modal photo detail route

### Modified Capabilities
- `photo-feed`: Photo viewing changes from modal navigation back to inline expansion, now powered by masonry layout's native expand support
- `photo-detail-modal`: **REMOVED** — modal route replaced by inline expansion
- `friend-photo-feed`: Uses inline expansion instead of modal
- `wave-detail`: Uses inline expansion instead of modal
- `starred-screen`: Uses inline expansion instead of modal

## Impact

- **Removed files**: `app/photo-detail.tsx` (modal route)
- **Removed state**: `photoDetailAtom` from `src/state.js`
- **Modified files**: `PhotosListMasonry.js` (add `expandedItemIds`, `getExpandedHeight` props), `ExpandableThumb/index.js` (render Photo when expanded), `usePhotoExpansion.js` (manage expandedItemIds state), `app/_layout.tsx` (remove photo-detail Stack.Screen)
- **Dependencies**: Uses `expo-masonry-layout` expand API (already available in local package)
- **Risk**: Height prediction for the full `<Photo>` component is imprecise since it loads content async. Mitigated by `onHeightMeasured` callback to re-trigger layout when actual height is known.
