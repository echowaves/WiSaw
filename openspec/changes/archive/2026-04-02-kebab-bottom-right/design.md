## Context

The ⋮ pill is rendered inside `renderCollapsedThumb()` in `ExpandableThumb`. It is absolutely positioned within a `position: 'relative'` container that also holds the `CachedImage` and the comments overlay. The comments overlay is absolutely positioned at `bottom: 0` with `left: 0, right: 0`. Both are children of the same container.

## Goals / Non-Goals

**Goals:**
- Position the ⋮ pill at the bottom-right of collapsed thumbnails
- Ensure it remains tappable when overlapping the comments overlay

**Non-Goals:**
- Changing the pill size, color, icon, or hit-slop
- Changing the comments overlay layout

## Decisions

**Decision: Use `bottom: 6` + `zIndex: 2` instead of conditional positioning**
Change `top: 6` to `bottom: 6` and add `zIndex: 2`. The comments overlay has no explicit zIndex (defaults to 0), so the pill layers above it. The pill's existing `rgba(0,0,0,0.4)` background provides sufficient contrast against both the photo and the overlay (`rgba(0,0,0,0.7)`).

*Alternative considered:* Conditionally position the pill (bottom-right when no comments, top-right when comments present). Rejected — introduces complexity and visual inconsistency for a 24×24 pill that already has its own dark background.

## Risks / Trade-offs

**[Risk] Pill partially obscures comment text in the bottom-right** → Acceptable: the pill is 24×24 pixels and the comment text is left-aligned. The stats row (💬 count, 🔖 count) is also left-aligned. The overlap is minimal.
