## Context

`PhotosListMasonry` renders an `ExpoMasonryLayout` in column mode with `expandedItemIds` to support inline photo expansion. The library has been upgraded to `forwardRef` with `useImperativeHandle`, exposing `scrollToItem(id, options)` and `scrollToOffset(offset, options)`. It also added an `autoScrollOnExpand` prop that internally detects `expandedItemIds` changes and scrolls to the toggled item. The client code never adopted these new APIs.

The masonry's scroll coordinates are independent of the screen header — headers render above the masonry in the view hierarchy, so `viewOffset` only needs a small breathing-room value, not a header-height subtraction.

The `handleScrollToTop` callback in `PhotosListMasonry` (used by `ScrollToTopFob`) calls `masonryRef.current.scrollToOffset({ offset: 0, animated: true })` — this matches the old `VirtualizedList` signature but not the new imperative handle's signature `scrollToOffset(offset, { animated })`.

## Goals / Non-Goals

**Goals:**
- Restore auto-scroll-to-expanded-item behavior on all four masonry screens (PhotosList, BookmarksList, FriendDetail, WaveDetail)
- Fix the `ScrollToTopFob` scroll call to work with the library's new ref API
- Clean up dead code in `usePhotoExpansion`

**Non-Goals:**
- No changes to the `expo-masonry-layout` library itself
- No changes to expansion state management (`toggleExpand`, `getExpandedHeight`, `updateExpandedHeight`)
- No changes to the `ScrollToTopFob` component internals

## Decisions

### 1. Use `autoScrollOnExpand` prop (not imperative `scrollToItem`)

**Choice**: Pass `autoScrollOnExpand={{ animated: true, viewOffset: 8 }}` to `ExpoMasonryLayout`.

**Why**: The library handles everything internally — diffing `expandedItemIds`, finding the target item's absolute position, and calling `scrollToOffset`. No client-side scroll tracking, no `lastScrollY` ref, no `ensureItemVisible` callback chain.

**Alternative considered**: Use `onExpandedItemLayout` callback + imperative `scrollToItem()` from the client. Rejected because it duplicates logic the library already encapsulates, and the library owns the `VirtualizedList` instance that performs the scroll.

### 2. `viewOffset: 8` for all screens

**Choice**: Use a fixed 8px view offset across all screens.

**Why**: The masonry content starts below the header in all four screens — headers are positioned above the masonry in the view hierarchy, not overlaying it. The `viewOffset` only controls breathing room above the expanded item within the masonry's own coordinate space. 8px provides visual separation without wasting space.

**Alternative considered**: Thread header height as a prop to compute per-screen offset. Rejected after verifying that masonry scroll coordinates are independent of header position.

### 3. Fix `scrollToOffset` call signature in `handleScrollToTop`

**Choice**: Change `masonryRef.current.scrollToOffset({ offset: 0, animated: true })` to `masonryRef.current.scrollToOffset(0, { animated: true })`.

**Why**: The library's `useImperativeHandle` exposes `scrollToOffset(offset, options)` — positional first argument, not an options bag. The old call would pass an object as the offset, breaking the scroll-to-top FOB.

### 4. Remove dead `handleScroll` stub from `usePhotoExpansion`

**Choice**: Remove the no-op `handleScroll` callback and stop exporting it.

**Why**: It was a leftover from the old system that tracked `lastScrollY` for `ensureItemVisible`. With the library owning scroll behavior, there's no consumer of this callback. `PhotosListMasonry` has its own `handleInternalScroll` for FOB visibility.

## Risks / Trade-offs

- **[Scroll-to-top FOB breakage]** The `scrollToOffset` signature change is a breaking API change. If the library update and client update aren't applied together, the FOB will break. → Mitigation: Both changes are in this single changeset.
- **[viewOffset too small on some devices]** 8px may feel tight on tablets with more visual space. → Acceptable for now; can be tuned later without structural changes.
