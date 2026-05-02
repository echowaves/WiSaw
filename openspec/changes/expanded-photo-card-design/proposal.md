## Why

The expanded photo view in the masonry feed lacks visual prominence. It renders as a flat container with `theme.BACKGROUND`, making it blend into the feed rather than standing out as a focused, interactive element. The action buttons appear above the photo (counterintuitive — users expect to act on content after seeing it), and there's no visual boundary signaling "this is an expanded card."

## What Changes

- Wrap the entire expanded photo view in a unified card container with `borderRadius: 20`, `overflow: 'hidden'`, themed border, and shadow — giving it a distinct, prominent appearance
- The photo image fills the card edge-to-edge, with its corners clipped by the parent card's `overflow: 'hidden'` for a modern, immersive look
- Move the action buttons card (ban, delete, bookmark, wave, share) from above the photo to below the photo and above the comments section
- Inner sections (photo info, comments, AI recognition) become flat sections inside the unified card instead of standalone cards, avoiding nested card-in-card visual heaviness
- Update the masonry height estimation logic to account for the outer card's margin and padding

## Capabilities

### New Capabilities

- `expanded-photo-card`: Unified card wrapper for the expanded photo view with rounded corners, shadow, reordered layout (photo → actions → info → comments → AI), and flattened inner sections

### Modified Capabilities

- `inline-expand`: Height estimation must account for outer card chrome (margins, padding, border) when calculating expanded item height in the masonry layout
- `photo-feed`: Expanded photo rendering order changes (action card moves below photo)

## Impact

- `src/components/Photo/index.js` — Main component: add outer card wrapper, reorder render sections, flatten inner section styles
- `src/components/Photo/ImageView.js` — May need minor adjustments for edge-to-edge rendering inside card
- `src/utils/photoListHelpers.js` — `estimateExpandedHeight` needs to account for card chrome
- `src/screens/PhotosList/components/PhotosListMasonry.js` — Close button positioning may need adjustment relative to card corner
- `src/theme/sharedStyles.js` — Potentially add an `expandedCard` container style variant
