## Why

When the feed screen (geo + bookmarks) is scrolled to the bottom, the SearchFab and FeedModeToggleFAB overlap the last row of photos. The masonry's `paddingBottom` (`FOOTER_HEIGHT + 20 = 110px`) doesn't account for the FAB height (56px) positioned at `footerHeight + 16` (106px), so the FAB top edge reaches 162px from the bottom — well above where the photos stop.

## What Changes

- **PhotosListMasonry** accepts an optional `contentPaddingBottom` prop that overrides the default `FOOTER_HEIGHT + 20` padding. When not provided, behavior is unchanged.
- **PhotosList** (the feed screen, the only consumer with FABs) passes a FAB-aware `contentPaddingBottom` value so the last photos sit above the FABs.

## Capabilities

### New Capabilities
(None — this is a layout fix within existing capabilities)

### Modified Capabilities
- `photo-feed`: The feed screen's scroll content padding bottom increases to account for floating action buttons, preventing content overlap.

## Impact

- `src/components/PhotosListMasonry/index.js` — new optional prop, default behavior preserved
- `src/screens/PhotosList/index.js` — passes FAB-aware padding value
- No impact on WaveDetail or FriendDetail (they don't render FABs and don't pass the prop)
