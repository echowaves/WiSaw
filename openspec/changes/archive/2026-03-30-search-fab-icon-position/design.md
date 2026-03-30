## Context

The SearchFab component (`src/components/SearchFab/index.js`) uses a two-sibling architecture: an `Animated.View` bar that expands L→R, and a `Pressable` FAB button that sits on top. The FAB is currently left-anchored at `left: 0` within the wrapper. A single Reanimated `useSharedValue` (`progress`, 0→1) drives the expansion animation. The bar has `paddingLeft: FAB_SIZE + 4` to leave room for the FAB on the left. The icon swaps from `search` to `send` based on `isExpanded`.

## Goals / Non-Goals

**Goals:**
- Animate the FAB from left to right when expanding, and right to left when collapsing
- Show magnifying glass icon when collapsed, send icon when expanded
- Keep the ✕ clear button visible only when input text is non-empty (already the case)
- No changes to state management, keyboard tracking, search behavior, or parent component integration

**Non-Goals:**
- Changing any search state flow (submitSearch, handleClearSearch, reload)
- Modifying keyboard tracking or bottom offset animation
- Changing the SearchFab props interface

## Decisions

### 1. Animate FAB position with translateX

**Decision**: Use the existing `progress` shared value to interpolate the FAB's `translateX` from `0` (collapsed, left edge) to `expandedWidth - FAB_SIZE` (expanded, right edge). This is applied as an animated style on the FAB `Pressable`.

```
translateX: interpolate(progress, [0, 1], [0, expandedWidth - FAB_SIZE])
```

**Rationale**: Reuses the existing animation driver — no new shared values needed. `translateX` is a transform property which is GPU-accelerated and won't trigger layout recalculations.

**Alternative considered**: Switching between `left: 0` and `right: 0` positioning — rejected because animating layout properties causes layout thrashing and you can't smoothly interpolate between `left` and `right`.

### 2. Swap bar padding direction

**Decision**: Animate the bar's internal padding so it leaves room for the FAB on whichever side it's on:
- Collapsed: `paddingLeft: FAB_SIZE + 4`, `paddingRight: 16` (FAB is on the left)
- Expanded: `paddingLeft: 16`, `paddingRight: FAB_SIZE + 4` (FAB is on the right)

Use `interpolate` on `progress` to transition both padding values smoothly.

**Rationale**: Ensures the TextInput and ✕ button don't overlap with the FAB in either position. Smooth padding transition prevents content jumping.

### 3. Icon stays as `search` vs `send` based on expanded state

**Decision**: Keep the existing `isExpanded ? 'send' : 'search'` icon logic. No change needed — the icon already swaps correctly.

**Rationale**: The current implementation already uses `send` when expanded and `search` when collapsed — this matches the proposal exactly.

## Risks / Trade-offs

- [Trade-off: FAB crosses over input during animation] During the expand/collapse animation, the FAB slides across the bar. Since the input fades in at `progress > 0.4`, the FAB will have mostly cleared the input area by the time it's visible. Acceptable — the animation is fast (~300ms).
- [Risk: Touch target during animation] The FAB is tappable during the animation. If the user taps while the FAB is mid-slide, it will still trigger the correct action (expand or submit). No issue here.
