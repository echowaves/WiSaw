## Context

The `column-masonry-modal-photo` change replaced the old hand-rolled inline expansion with a fullScreenModal route (`/photo-detail`). While this eliminated 400+ lines of dimension management and scroll anchoring, it creates a context switch — the user leaves the feed to view photo details.

Meanwhile, `expo-masonry-layout` (local at `../expo-masonry-layout`) has shipped native inline expand support in column mode. The API:
- `expandedItemIds: string[]` — which items are expanded full-width
- `getExpandedHeight: (item, fullWidth) => number` — deterministic height for expanded items
- `isExpanded: boolean` in `renderItem` info — tells the renderer which mode to use
- The engine handles waterline flushing, full-width placement, and band virtualization

Current state of WiSaw codebase has the modal approach implemented: `photoDetailAtom`, `app/photo-detail.tsx`, `router.push('/photo-detail')` on thumb press.

## Goals / Non-Goals

**Goals:**
- Replace modal photo detail with inline expansion using the masonry layout's native expand API
- Render the full `<Photo>` component inline when expanded (reuse existing 1259-line component)
- Handle dynamic height changes when async content loads (comments, photo details)
- Maintain scroll position context — user sees the expanded photo in the feed, not a separate screen
- Keep comment section below thumbnails in bookmarked segment (already working)

**Non-Goals:**
- Rewriting the Photo component — it works, we just render it inline instead of in a modal
- Supporting multiple simultaneously expanded items — expand one at a time (toggle behavior)
- Animated expand/collapse transitions — defer to a follow-up change
- Changing the masonry layout library's expand implementation

## Decisions

### 1. Single expansion state via `expandedItemIds` array

**Decision**: Store a single `expandedPhotoId` string (or null) in a `useState` in `usePhotoExpansion`, convert to `[expandedPhotoId]` array for the masonry prop.

**Rationale**: The masonry API supports multiple expanded items, but for photo viewing UX, only one should be expanded at a time. Tapping another thumb collapses the current and expands the new one.

**Alternative**: Allow multiple expansions. Rejected — confusing UX with multiple full-width photos interspersed in the feed, and `getExpandedHeight` cost multiplies.

### 2. Height estimation + re-measure strategy for `getExpandedHeight`

**Decision**: Provide a deterministic initial height estimate based on:
```
expandedHeight = imageHeight(aspectRatio, fullWidth) + ACTION_BAR_HEIGHT + COMMENTS_ESTIMATE + PADDING
```
Then use `<Photo onHeightMeasured={...}>` to get the actual rendered height. When actual height differs, update a height cache and trigger relayout by bumping a state key or re-setting `expandedItemIds`.

**Rationale**: The masonry engine requires a height *before* rendering the item. The Photo component loads details and comments async, so the initial estimate will be wrong. The `onHeightMeasured` callback gives us the real height after render. Updating the height cache and re-triggering layout corrects it.

**Alternative**: Use a fixed height with internal scrolling inside the expanded item. Rejected — nested scrolling inside a VirtualizedList causes gesture conflicts on both platforms.

**Alternative**: Pre-fetch photo details before expanding. Rejected — adds latency to the tap-to-expand interaction.

### 3. `expandedHeights` ref-based cache

**Decision**: Maintain a `useRef<Map<string, number>>()` mapping photo IDs to their measured expanded heights. `getExpandedHeight` reads from this cache (if available) or returns the aspect-ratio-based estimate.

**Rationale**: Refs don't trigger re-renders. The height cache accumulates across expand/collapse cycles so previously-expanded photos get accurate heights immediately on re-expansion.

### 4. Render Photo component with `embedded={true}` inside expanded item

**Decision**: The expanded masonry item renders `<Photo photo={item} embedded={true} onHeightMeasured={updateCache} />` wrapped in a `PhotosListContext.Provider`.

**Rationale**: `embedded={true}` collapses AI sections by default, uses reduced safe area offsets, and skips the close button — all appropriate for inline viewing. The close/collapse action is handled by a collapse button added to the ExpandableThumb wrapper.

### 5. Remove modal route and atom

**Decision**: Delete `app/photo-detail.tsx`, remove `photoDetailAtom` from `src/state.js`, remove the Stack.Screen entry from `app/_layout.tsx`.

**Rationale**: The modal is fully replaced by inline expansion. Keeping dead code creates confusion.

## Risks / Trade-offs

**[Height flicker on first expansion]** → The initial height estimate will differ from the actual measured height, causing a visible relayout. Mitigation: make the estimate conservative (slightly too tall), and the height cache prevents flicker on re-expansion of the same photo.

**[Performance of full Photo component in VirtualizedList]** → The Photo component is 1259 lines with multiple sub-renders, hooks, and an Apollo query. Rendering it inside a VirtualizedList item could cause jank. Mitigation: The masonry engine places expanded items in their own dedicated band, so they virtualize independently. Only one is expanded at a time.

**[Keyboard interaction for comment input]** → Adding a comment in the inline expanded photo raises the keyboard, which may obscure the input or cause scroll jumps in the outer VirtualizedList. Mitigation: The existing `KeyboardProvider` (from `react-native-keyboard-controller`) should handle avoidance. If not, this is a known limitation to address in a follow-up.

**[Scroll position after collapse]** → When an expanded item collapses, everything below shifts up. The user's visual anchor may jump. Mitigation: The masonry engine handles relayout; the previous `usePhotoExpansion` scroll anchoring was removed but could be re-added as a thin wrapper if needed.
