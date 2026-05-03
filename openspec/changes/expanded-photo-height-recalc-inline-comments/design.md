## Context

The expanded photo detail view renders inside a masonry grid cell via `expo-masonry-layout`'s `expandedItemIds` API. The client currently maintains a complex height measurement pipeline: `scheduleHeightRecalc()` → `view.measure()` → `onHeightMeasured` callback → `updateExpandedHeight` in `usePhotoExpansion` → cache update with threshold guards → `layoutVersion` bump → masonry relayout.

This pipeline only fires in two situations: after initial `photoDetails` load and when AI recognition sections are toggled. All other content-changing interactions (bookmark toggle, comment metadata expand/collapse, comment deletion) leave the cell at stale height, causing clipping or dead space.

The latest `expo-masonry-layout` release adds **automatic height measurement** for expanded items — the library watches `onLayout` on expanded cells and re-layouts when measured height changes. It also adds a `notifyHeightChanged(id, newHeight)` imperative method for programmatic height updates. These features eliminate the need for the entire client-side measurement pipeline.

Comments are composed via a full-screen modal route (`/modal-input`), which loses scroll position and context when navigating away from the expanded card.

## Goals / Non-Goals

**Goals:**
- Upgrade `expo-masonry-layout` to leverage auto-measurement, eliminating client-side height tracking
- Remove the entire client-side height measurement pipeline (scheduleHeightRecalc, onHeightMeasured, updateExpandedHeight, caches, thresholds)
- Add inline comment input within the expanded card (embedded mode only)
- Keep the existing modal comment input for standalone Photo views

**Non-Goals:**
- No changes to comment data model or API
- No internal scrolling within the expanded cell — the cell grows and the masonry scrolls
- No inline comment input for non-embedded Photo views (standalone screens keep the modal)

## Decisions

### 1. Delegate height management to library auto-measurement

**Choice**: Upgrade `expo-masonry-layout` and rely on its built-in `onLayout`-based auto-measurement instead of the client-side pipeline.

**Why**: The library renders expanded items without a fixed height constraint and measures them via `onLayout`. When measured height differs from the estimate, the layout automatically recalculates. This means every content-changing interaction (bookmark toggle, comment expand/collapse, comment deletion, AI section toggle, inline input show/hide) that causes a React re-render naturally triggers `onLayout` → library catches it → relayout. No client-side measurement code needed.

**Alternative considered**: Unified `useEffect` calling `scheduleHeightRecalc()` on all height-affecting state changes. Rejected because the library now handles this natively — maintaining a parallel client-side system adds complexity and potential timing conflicts.

### 2. Remove entire client-side measurement pipeline

**Choice**: Delete from `usePhotoExpansion.js`: `expandedHeightsCache`, `correctionCounts`, `layoutVersion`, `updateExpandedHeight`, `HEIGHT_CHANGE_THRESHOLD`, `MAX_CORRECTIONS`, `LARGE_CHANGE_THRESHOLD` constants. Delete from `Photo/index.js`: `scheduleHeightRecalc()`, `containerRef` measurement logic, the `onLayout` guard for embedded mode. Remove `onHeightMeasured` prop from Photo in `PhotosListMasonry.js`.

**Why**: All of this was a client-side workaround for the library not auto-measuring. The library now does it natively. Keeping dead code alongside the library's mechanism risks conflicts (double relayout) and confuses future developers.

**What remains in `usePhotoExpansion`**: `expandedPhotoId` state, `toggleExpand`, `getExpandedHeight` (returns initial estimate from aspect ratio — library auto-corrects after render), `masonryRef`, `expandedItemIds` array.

### 3. Keep `getExpandedHeight` as initial estimate

**Choice**: Keep the `getExpandedHeight` callback that returns `imageHeight + ACTION_BAR_HEIGHT + COMMENTS_ESTIMATE + PADDING`. The library uses this as the initial height before auto-measurement corrects it.

**Why**: Without an estimate, the library defaults to `screenWidth` as the initial height. Our estimate based on aspect ratio + chrome is closer to the real height, reducing the visual jump on first expansion. The library still auto-corrects after the first render.

### 4. Inline comment input as local state toggle

**Choice**: Add `showCommentInput` boolean state to the Photo component. When true, `renderAddCommentsRow()` renders a `TextInput` + send button instead of the "Add Comment" button.

**Why**: This is the simplest approach — no new components, no routing, no context providers. The state is purely local to the Photo instance. The library auto-measurement catches the height change when the input appears/disappears.

### 5. Auto-focus TextInput on show

**Choice**: Set `autoFocus={true}` on the inline TextInput. This opens the keyboard immediately when the input appears.

**Why**: The user tapped "Add Comment" — they intend to type. Immediate keyboard appearance is the expected UX. React Native's keyboard avoidance will scroll the VirtualizedList to keep the focused input visible.

### 6. Submit flow: optimistic + refresh

**Choice**: On submit, immediately add an optimistic comment (reusing existing `setOptimisticComment`), hide the input, call `reducer.submitComment()`, then emit `photoRefreshBus` event.

**Why**: This matches the existing modal submit flow exactly — same reducer, same optimistic pattern, same bus event. The only difference is the input source (inline vs modal).

### 7. Keep modal route for standalone views

**Choice**: The `/modal-input` route stays. When `embedded === false`, the "Add Comment" button continues navigating to the modal.

**Why**: Standalone Photo views (shared photo detail, pinch modal) don't need masonry height management. The modal works fine there and changing it is out of scope.

## Risks / Trade-offs

- **[Keyboard scroll behavior in masonry cells]** React Native's `VirtualizedList` should auto-scroll to keep a focused `TextInput` visible, but this hasn't been tested with a TextInput deep inside an expanded masonry cell. → Mitigation: Test on iOS and Android. If VirtualizedList doesn't scroll correctly, `scrollToItem` on the masonry ref can be called explicitly when the input focuses.
- **[Library version dependency]** The auto-measurement feature is brand new in `expo-masonry-layout`. If bugs are discovered, we may need to patch the library. → Mitigation: The library is owned by the same team. Issues can be fixed upstream quickly.
- **[Visual jump on first expand]** The `getExpandedHeight` estimate may differ from final rendered height, causing a brief visual adjustment. → Mitigation: This already happens today and is acceptable. The estimate is close enough that the jump is minimal.
