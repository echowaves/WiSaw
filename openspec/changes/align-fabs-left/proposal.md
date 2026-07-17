## Why

The Bookmarks FAB and Search FAB are currently stacked vertically on the right side of the screen. Consolidating them onto a single left-aligned row reduces visual clutter, frees up the right side of the screen, and creates a more balanced layout where the two action buttons sit together as a cohesive pair.

## What Changes

- **Bookmarks FAB repositioned** — Move `FeedModeToggleFAB` from right-aligned (stacked above SearchFab) to left-aligned on the same horizontal row as the SearchFab
- **SearchFab anchor flipped** — Reposition `SearchFab` from right-anchored to left-anchored (after the Bookmarks FAB with an 8px gap). The expanded bar now grows rightward instead of leftward. The send icon animates from the left edge to the right edge of the bar on expand
- **Same vertical baseline** — Both FABs share `bottom: FOOTER_HEIGHT + 16`, no longer stacked

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `search-fab`: FAB position changes from bottom-right to bottom-left. The expanded bar anchor flips from right to left. The FAB button animation direction reverses (slides left-to-right on expand instead of right-to-left). The Bookmarks FAB now sits to the left of the SearchFab on the same row

## Impact

- `src/components/SearchFab/index.js` — wrapper positioning, bar anchor, FAB slide direction, expansion animation
- `src/components/FeedModeToggleFAB/index.js` — horizontal position from `right: 16` to `left: 16`, vertical position from stacked above to same row
- `openspec/specs/search-fab/spec.md` — delta spec to update position requirements (corner, anchor edge, animation direction)
