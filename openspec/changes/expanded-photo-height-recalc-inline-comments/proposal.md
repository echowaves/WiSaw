## Why

The expanded photo element in the masonry grid does not recalculate its height when content changes after initial load. Interactions like toggling bookmarks, expanding/collapsing comment metadata, and deleting comments leave the masonry cell at a stale height — clipping content or leaving dead space, making parts of the component unusable. Additionally, the comment input currently navigates to a full-screen modal (`/modal-input`), which breaks context and scroll position. An inline comment input within the expanded card would provide a smoother UX.

## What Changes

- **Upgrade `expo-masonry-layout`**: Upgrade to the latest version which adds automatic height measurement for expanded items. The library now watches `onLayout` on expanded cells and re-layouts automatically when content height changes — no client-side measurement pipeline needed.
- **Remove client-side height measurement pipeline**: Delete `scheduleHeightRecalc()`, `onHeightMeasured` prop wiring, `updateExpandedHeight`, `expandedHeightsCache`, `correctionCounts`, `layoutVersion` state, and all related constants (`HEIGHT_CHANGE_THRESHOLD`, `MAX_CORRECTIONS`, `LARGE_CHANGE_THRESHOLD`). The library's auto-measurement replaces all of this.
- **Inline comment input**: Replace the "Add Comment" button with an in-place `TextInput` + send button when tapped. The input renders inside the expanded card, the cell grows automatically (via library auto-measurement), and the keyboard's native scroll-to-input behavior keeps it visible. On submit, the comment is posted, the input collapses back to the "Add Comment" button.
- **Keep modal route**: The `/modal-input` route remains for non-embedded (standalone) Photo views. Inline input is only for `embedded === true`.

## Capabilities

### New Capabilities
- `inline-comment-input`: Inline comment composition within the expanded photo card in embedded mode, replacing navigation to the modal input route

### Modified Capabilities
- `inline-expand`: Replace client-side height measurement pipeline with library auto-measurement. Remove `onHeightMeasured`, `scheduleHeightRecalc`, `updateExpandedHeight`, and all associated caching/throttling logic. The library's `onLayout`-based auto-measurement handles all content-changing interactions automatically
- `comments`: Add requirement that when the Photo component is in embedded mode, the "Add Comment" action opens an inline text input within the card instead of navigating to the modal route

## Impact

- **Modified files**: `src/components/Photo/index.js` (remove height measurement pipeline, add inline comment input), `src/screens/PhotosList/hooks/usePhotoExpansion.js` (strip to minimal: expandedPhotoId + toggleExpand + getExpandedHeight estimate only), `src/screens/PhotosList/components/PhotosListMasonry.js` (remove `onHeightMeasured`/`updateExpandedHeight` prop wiring)
- **Preserved files**: `app/modal-input.tsx` (kept for standalone Photo views)
- **Dependencies**: Upgrade `expo-masonry-layout` to latest version with auto-measurement support
- **Risk**: Keyboard opening inside a masonry cell may need testing across iOS/Android to verify VirtualizedList scroll-to-input works correctly within expanded cells
