## Why

When a user taps a thumbnail to expand it inline, the expanded photo detail often remains partially or fully off-screen. The feed used to auto-scroll to the expanded item, but this behavior was lost during the `inline-expand-photo-detail` change which rebuilt expansion on top of `expo-masonry-layout`'s native `expandedItemIds` API. The library has since shipped built-in auto-scroll support (`autoScrollOnExpand` prop), but the client never adopted it.

## What Changes

- Pass `autoScrollOnExpand` prop to `ExpoMasonryLayout` in `PhotosListMasonry` so the library auto-scrolls to the expanded item when `expandedItemIds` changes
- Update `handleScrollToTop` in `PhotosListMasonry` to use the new imperative `scrollToOffset` signature exposed by the library's `forwardRef`/`useImperativeHandle` upgrade
- Remove dead `handleScroll` no-op stub from `usePhotoExpansion` hook

## Capabilities

### New Capabilities
_None_ — this restores previously-existing scroll-to-expanded behavior using the library's built-in API.

### Modified Capabilities
- `inline-expand`: Add requirement that the masonry grid auto-scrolls to position the expanded item at the top of the viewport when a thumbnail is tapped

## Impact

- **Modified files**: `src/screens/PhotosList/components/PhotosListMasonry.js` (add prop, fix scroll signature), `src/screens/PhotosList/hooks/usePhotoExpansion.js` (remove dead code)
- **Dependencies**: Requires `expo-masonry-layout` version with `autoScrollOnExpand` and `forwardRef` support (already installed)
- **All screens benefit**: PhotosList, BookmarksList, FriendDetail, WaveDetail — all flow through `PhotosListMasonry`
- **Risk**: Low — additive prop, no structural changes
