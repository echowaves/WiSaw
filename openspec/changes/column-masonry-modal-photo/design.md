## Context

The WiSaw photo feed currently uses row-based masonry layout (`ExpoMasonryLayout` with default `layoutMode='row'`). When a user taps a thumbnail, the `ExpandableThumb` component expands inline, rendering a 1200+ line `Photo` component inside the VirtualizedList item. This requires:

- `usePhotoExpansion` hook (240 lines): manages `expandedPhotoIds` Set, measured heights, scroll anchoring, scroll-to-visible, collapse tracking
- `ExpandableThumb` (500 lines): handles both collapsed and expanded states, dimension switching, global callback registry for minimize
- `PhotosListMasonry`: defensive dimension correction, dynamic `getItemDimensions`, 15+ expansion-related props
- Four parent screens wire expansion state through to masonry

The inline expansion architecture is inherently fragile because VirtualizedList items must have deterministic heights, but the expanded Photo component has dynamic height (comments, AI tags, etc.).

A previous attempt to add "comments below thumbnail" failed because row-based layout shares height across all items in a row — photos without comments got dead space to match neighbors with comment sections.

The `expo-masonry-layout` library (local at `../expo-masonry-layout`) already supports `layoutMode='column'` (Pinterest-style) and `getExtraHeight` callback for adding height below the image area per-item.

## Goals / Non-Goals

**Goals:**
- Switch masonry grid from row mode to column mode so each photo has independent height
- Replace inline photo expansion with a fullScreenModal route (`/photo-detail`)
- Add comment sections below thumbnails in the bookmarked segment using `getExtraHeight`
- Simplify ExpandableThumb to a collapsed-only thumbnail component
- Eliminate or drastically reduce `usePhotoExpansion`
- Remove the dimension correction hack from `PhotosListMasonry`

**Non-Goals:**
- Changing the Photo component's internal rendering or features
- Modifying the GraphQL API or data model
- Changing the pinch-to-zoom or comment input modal flows
- Refreshing grid data when the photo-detail modal closes (accept stale counts until next feed load)
- Horizontal/landscape layout support

## Decisions

### 1. Column mode for all segments, not just bookmarks

**Decision**: Use `layoutMode='column'` with `columns={2}` for all segments across all screens (PhotosList, BookmarksList, WaveDetail, FriendDetail).

**Rationale**: Maintaining two layout modes (row for segment 0, column for segment 1) would require keeping the entire row-mode dimension pipeline (`getItemDimensions`, `calculatePhotoDimensions`, dimension correction) alongside the new column-mode code. Switching everything to column mode eliminates all of that. Column mode computes dimensions directly from `item.width/item.height` aspect ratios — no `getItemDimensions` callback needed.

**Alternative considered**: Row mode for segment 0, column for segment 1. Rejected due to code complexity — maintaining two layout pipelines defeats the purpose of simplification.

### 2. Jotai atom for photo detail data transfer

**Decision**: Add `photoDetailAtom` to `src/state.js` to pass photo data and `removePhoto` callback to the modal route.

**Shape**: `atom(null)` — set to `{ photo, removePhoto }` before navigation, cleared on modal dismiss.

**Rationale**: Route params can't carry functions (`removePhoto`). A Jotai atom is the existing pattern in the app (used for `uuid`, `isDarkMode`, `friendsList`, etc.) and requires no new infrastructure. The atom is transient — set before `router.push`, read in the modal, cleared on back.

**Alternative considered**: React context wrapping the root layout. Rejected — too heavy; would require lifting `removePhoto` to root level from four different screens.

### 3. fullScreenModal route at `/photo-detail`

**Decision**: New file `app/photo-detail.tsx` registered as `presentation: 'fullScreenModal'` in the root Stack, matching the existing `/pinch` route pattern.

**Rationale**: `fullScreenModal` covers the entire screen, preserving grid scroll position underneath. The Photo component already has an `embedded` prop — `embedded={false}` gives it standalone layout with its own safe area handling. The close button already falls back to `router.back()` when `global.expandableThumbMinimize` is not set.

**Alternative considered**: `presentation: 'modal'` (half-sheet). Rejected — the Photo component needs full screen for image, comments, action buttons, AI tags.

### 4. Comment section height: fixed 44px via getExtraHeight

**Decision**: `COMMENT_SECTION_HEIGHT = 44` defined in `photoListHelpers.js`. The masonry layout's `getExtraHeight` callback returns 44 for items with comments in the bookmarked segment, 0 otherwise.

**Rationale**: Fixed height keeps the masonry layout deterministic (no layout thrashing). 44px fits one line of text (11px font, 14px line height) plus a stats row with icons. The `getExtraHeight` is natively supported in both row and column modes of the masonry library.

### 5. removePhoto in modal via PhotosListContext

**Decision**: The `photo-detail.tsx` modal wraps its content in a `PhotosListContext.Provider` using the `removePhoto` function from `photoDetailAtom`. This lets the Photo component's delete/ban actions work unchanged.

**Rationale**: Photo component already reads `removePhoto` from `PhotosListContext`. By providing it in the modal, no changes needed to Photo's deletion flow. The `removePhoto` function reference points to the source screen's `useFeedLoader.removePhoto`, so deleting a photo in the modal removes it from the underlying grid.

### 6. Eliminate inline expansion entirely

**Decision**: Remove all expansion logic from ExpandableThumb, usePhotoExpansion, and PhotosListMasonry. Tapping a thumbnail navigates to `/photo-detail`. No inline expansion in any segment or screen.

**Rationale**: Keeping inline expansion for some segments/screens while using modal for others would create two code paths and UX inconsistency. Clean break — all photo viewing goes through the modal.

## Risks / Trade-offs

**[UX change]** Users accustomed to inline expansion will now see a modal. → Mitigation: Modal is the standard pattern (Instagram, Pinterest). The transition is familiar. Grid scroll position is preserved.

**[Wide blast radius]** Four parent screens + masonry + thumb all change. → Mitigation: Most changes are *removing* code (expansion wiring). The remaining code is simpler. Spec-driven tasks allow incremental implementation.

**[Stale grid data after modal]** If user adds a comment in the modal, the grid thumbnail won't update until next feed load. → Mitigation: Accept for now (Phase 1). Can add refresh-on-dismiss later via `photoRefreshBus` to update the specific photo in the feed list.

**[Column mode visual change]** Switching from row to column mode changes the visual rhythm of the grid globally. → Mitigation: Column mode with 2 columns is the industry standard (Pinterest, Instagram Explore). Photos get more vertical space, which is generally better for portrait-orientation content.

**[removePhoto closure scope]** The `removePhoto` stored in the atom is a closure from the source screen. If the screen unmounts while the modal is open, the function could be stale. → Mitigation: The screens don't unmount while a modal is on top (modal overlays, doesn't replace). The source screen stays mounted underneath.
