## Context

`PhotosListMasonry` is shared by three screens (PhotosList/feed, WaveDetail, FriendDetail). It sets `contentContainerStyle.paddingBottom` to `FOOTER_HEIGHT + 20` (110px). Only the feed screen renders FABs (SearchFab at bottom 106px + 56px height = 162px top edge). The current padding doesn't account for the FAB overlay, causing the last photos to be partially covered.

## Goals / Non-Goals

**Goals:**
- Last photos in the feed sit fully above the FABs when scrolled to the bottom
- Other consumers (WaveDetail, FriendDetail) are unaffected
- No coupling between `PhotosListMasonry` and FAB internals

**Non-Goals:**
- Changing FAB positioning or sizing
- Modifying the masonry NPM package
- Affecting WaveDetail or FriendDetail scroll padding

## Decisions

**Decision: Optional `contentPaddingBottom` prop on PhotosListMasonry**
- When provided, overrides the default `FOOTER_HEIGHT + 20` padding
- When omitted (WaveDetail, FriendDetail), default behavior is preserved
- Feed screen computes `FOOTER_HEIGHT + FAB_SIZE + 16 + 16` (footer + gap + FAB + breathing room) = ~178px

**Alternatives considered:**
- Hardcoding larger padding in masonry — would affect all consumers unnecessarily
- Passing a `hasFabs` flag — less explicit, couples component to knowledge about FABs
- Wrapping masonry in a View with padding — would break the existing prop-based pattern

## Risks / Trade-offs

- Minimal risk: new optional prop with clear default fallback
- Padding calculation is screen-specific; if FAB sizing changes in the future, the feed screen's padding value should be updated accordingly
