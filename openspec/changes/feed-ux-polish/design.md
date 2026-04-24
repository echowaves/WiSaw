## Context

The photo feed uses three overlapping UI controls that create visual confusion:

- **ScrollToTopFob**: 40px circle at `top: 12, right: 12` with `chevron-up` icon, slides in from the right when scrolling down past 200px
- **Expanded photo collapse button**: 32px circle at `top: 8, right: 8` with `chevron-up` icon, always visible on expanded photos
- **SearchFab clear button**: 22px circle inside the search bar, only visible when `searchTerm.length > 0`

After the `masonry-auto-scroll-on-expand` change, expanded photos are now auto-scrolled to the viewport top — placing the collapse button directly under the FOB whenever the FOB is visible. Both buttons look identical.

The SearchFab sits at bottom-left, which is the opposite corner from the FOB's current position. Moving the FOB to top-left avoids overlap with the collapse button while maintaining spatial separation from the SearchFab (top-left vs bottom-left).

## Goals / Non-Goals

**Goals:**
- Eliminate visual overlap between scroll-to-top FOB and expanded photo collapse button
- Make each control visually distinct through icon differentiation
- Allow users to dismiss the search bar without typing text first

**Non-Goals:**
- No changes to FOB show/hide logic (scroll threshold, inactivity timer)
- No changes to SearchFab expand/collapse animation mechanics
- No changes to the `CloseButton` component itself
- No reuse of `CloseButton` in the expanded photo — inline styling is kept consistent with the existing pattern in `renderMasonryItem`

## Decisions

### 1. FOB moves to top-left with reversed animation

**Choice**: Change `ScrollToTopFob` container from `right: 12` to `left: 12`. Reverse `translateX` values: enter from `-80` (off-screen left) to `0`, dismiss from `0` to `-80`.

**Why**: The top-right corner is occupied by the expanded photo's collapse button. The SearchFab occupies bottom-left but they're 500+ pixels apart vertically — no conflict. Top-left is otherwise unused in the masonry layout.

**Alternative considered**: Move the collapse button to a different position instead. Rejected because the collapse button's top-right position is a standard dismiss affordance (matching the `CloseButton` pattern used elsewhere).

### 2. Collapse icon changes to `close` (X)

**Choice**: Change `Ionicons name='chevron-up'` to `Ionicons name='close'` in the expanded photo's collapse button in `renderMasonryItem`.

**Why**: `close` (X) communicates "dismiss this expanded view" which matches `CloseButton` used in `QuickActionsModal` and other overlays. `chevron-up` communicates "scroll up" which conflicts with the FOB's purpose. Even after moving the FOB to the left, keeping both as `chevron-up` would be semantically confusing.

### 3. SearchFab clear button always visible when expanded

**Choice**: Change `{searchTerm.length > 0 && (<Pressable ...>)}` to `{isExpanded && (<Pressable ...>)}` in `SearchFab`. The `onClearSearch` handler already clears text AND collapses the bar, so it works correctly for both empty and non-empty states.

**Why**: Users who open the search bar and change their mind have no way to dismiss it without typing 3+ characters and submitting. The X button is the natural dismiss affordance.

**Alternative considered**: Add a separate "cancel" button. Rejected — the clear button already handles both clearing text and collapsing the bar via `handleClearSearch` in `useFeedSearch`.

## Risks / Trade-offs

- **[Left-hand FOB reachability]** Left-positioned FOB may be slightly less ergonomic for right-handed single-hand use. → Acceptable trade-off vs. the overlap problem. The FOB is a convenience shortcut, not a primary action.
- **[Search dismiss with text]** Tapping X when text is entered now collapses immediately (clears text + collapses in one action). Previously users had to clear first, then tap away. → This is simpler UX. If users want to keep their text and just dismiss the keyboard, they can tap outside the search bar.
