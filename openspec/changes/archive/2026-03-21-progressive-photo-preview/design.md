## Context

QuickActionsModal currently renders the photo preview using React Native's basic `Image` component with only the thumbnail URL. The expandable photo view (`ImageView.js`) and pinch view (`PinchableView.js`) both use a proven two-layer progressive loading pattern with `expo-cached-image` (CachedImage) — thumbnail at zIndex 1, full image at zIndex 2, shared disk cache. This design brings the modal in line with that pattern.

## Goals / Non-Goals

**Goals:**
- Match the ImageView progressive loading pattern in QuickActionsModal
- Share disk cache with the feed's image views via consistent cache keys
- Show a spinner placeholder while the thumbnail loads

**Non-Goals:**
- Changing the modal's square aspect ratio crop (stays `aspectRatio: 1`)
- Modifying the ImageView or PinchableView components
- Adding any new dependencies

## Decisions

### Use CachedImage with two-layer stacking (same as ImageView)

**Choice**: Two absolutely-positioned `CachedImage` layers inside the existing thumbnail container.

**Rationale**: This is the exact pattern already proven in `ImageView.js` and `PinchableView.js`. Using the same approach means consistent behavior, shared cache keys (`${photo.id}` and `${photo.id}-thumb`), and no new abstractions needed.

**Alternative considered**: Extract a shared `ProgressiveImage` component used by both ImageView and QuickActionsModal. Rejected — over-engineering for this scope, and the two contexts have different container styles (aspect-ratio-preserving vs square crop) and different resize modes.

### Guard with isValidImageUri before rendering each layer

**Choice**: Wrap each `CachedImage` in an `isValidImageUri()` check, matching the ImageView pattern.

**Rationale**: The photo object's `imgUrl` or `thumbUrl` could be null/undefined for edge cases (deleted photos, network errors). The utility already exists at `src/utils/isValidImageUri`.

## Risks / Trade-offs

- **[Minimal risk] Slightly more memory per modal open** → Two images loaded instead of one, but the full image may already be cached from feed scrolling, so net impact is negligible.
- **[Visual] Square crop on full image** → The full image uses `resizeMode: 'cover'` in a square container, same as the current thumbnail. No visual regression.
