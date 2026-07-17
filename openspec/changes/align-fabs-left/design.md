## Context

The PhotosList screen renders two FABs: `FeedModeToggleFAB` (bookmarks toggle, 56x56, right-aligned, stacked above) and `SearchFab` (expanding search bar, right-anchored, lower). Both are absolutely positioned with `right: HORIZONTAL_MARGIN` (16px). The SearchFab's expanded bar grows leftward from the right edge, and the FAB button slides leftward on expand.

The existing layout:
```
    [space]                                [🌍]  ← bookmarks FAB (right, higher)
    [space]                                [🔍]  ← search FAB (right, lower)
    ─────────────────────────────────────────────  ← footer
```

Current code structure:
- `FeedModeToggleFAB`: `position: absolute`, `right: 16`, `bottom: footerHeight + 84`
- `SearchFab`: wrapper is `position: absolute`, `left: 16`, `right: 16`, `bottom: footerHeight + 16`. Internal bar is `position: absolute`, `right: 0`, `justifyContent: flex-end`. FAB slides via `translateX` from 0 to `-(expandedWidth - FAB_SIZE)`

## Goals / Non-Goals

**Goals:**
- Both FABs on the same horizontal row, left-aligned
- Bookmarks FAB first (leftmost), then SearchFab with 8px gap
- SearchFab bar grows rightward on expand
- Preserve all existing animations, keyboard behavior, and haptic feedback
- Minimal diff — only change positioning logic, not behavior

**Non-Goals:**
- Changing FAB size, colors, or icons
- Adding new FAB functionality
- Modifying the empty state rendering paths

## Decisions

### 1. Bookmarks FAB: `right: 16` → `left: 16`, same vertical position

The `FeedModeToggleFAB` moves from `right: 16` to `left: 16` and from `bottom: footerHeight + 84` to `bottom: footerHeight + 16` (same vertical baseline as SearchFab).

### 2. SearchFab: left-anchored wrapper with offset start

The wrapper stays `position: absolute` with `left: 16` and `right: 16` (full width available), but the internal bar is anchored to the **left** with an offset equal to `FAB_SIZE + 8` (bookmarks FAB width + gap). The bar grows rightward.

Collapsed state: bar width = `FAB_SIZE`, starting at `left: FAB_SIZE + 8`
Expanded state: bar width = `screenWidth - HORIZONTAL_MARGIN - (FAB_SIZE + 8)`, filling to the right edge

The FAB button starts at the left edge of the bar (collapsed = `translateX: 0`, icon = `search`) and slides to the right edge on expand (`translateX: expandedWidth - FAB_SIZE`, icon = `send`).

### 3. Expanded width calculation

```
bookmarksOffset = FAB_SIZE + GAP  // 56 + 8 = 64
expandedWidth = screenWidth - HORIZONTAL_MARGIN - bookmarksOffset
```

The input padding transitions:
- Collapsed: `paddingLeft: 16, paddingRight: FAB_SIZE + 4`
- Expanded: `paddingLeft: FAB_SIZE + 4, paddingRight: 16`

### 4. Bar positioning: absolute within wrapper, left-anchored

```
barStyle: {
  position: 'absolute',
  left: FAB_SIZE + GAP,  // offset for bookmarks FAB
  height: FAB_SIZE,
  // width animated from FAB_SIZE to expandedWidth
}
```

### 5. Keyboard lift applies to both FABs

Both FABs lift together when the keyboard opens. `FeedModeToggleFAB` now uses `useReanimatedKeyboardAnimation` with the same `keyboardStyle` pattern as `SearchFab` — wrapping the `Pressable` in an `Animated.View` that lifts via `translateY` and adjusts `bottom`. This keeps both FABs on the same horizontal row above the keyboard.

## Risks / Trade-offs

- **Animation direction reversal**: The `translateX` interpolation values flip signs. Risk of getting the direction wrong. Mitigation: test on device, verify spring animation reads naturally
- **Small screens**: On very narrow devices (e.g., iPhone SE 375px width), the expanded bar has less room. `expandedWidth = 375 - 16 - 64 = 295px` for the bar, minus FAB size = ~235px for input. Still usable but tight
- **Touch target proximity**: Two 56px FABs with 8px gap. Both targets are well above the 44px minimum, and the gap provides adequate separation
