## Why

The long-press photo preview in QuickActionsModal uses a plain React Native `Image` with only the thumbnail URL. This means no disk caching (re-downloads every time), no progressive loading, and the user never sees the full-resolution image. The expandable photo view (ImageView) already implements a two-layer progressive loading pattern using `expo-cached-image` — thumbnail loads fast underneath, full image loads on top. The modal should follow the same pattern for a consistent, higher-quality preview experience.

## What Changes

- Replace the single `<Image source={{ uri: photo.thumbUrl }}>` in QuickActionsModal with the two-layer `CachedImage` progressive loading pattern from ImageView
- Layer 1 (zIndex: 1): `CachedImage` with `photo.thumbUrl` + `ActivityIndicator` placeholder — loads fast, shows immediately
- Layer 2 (zIndex: 2): `CachedImage` with `photo.imgUrl` — loads full-resolution on top when ready
- Use consistent cache keys (`${photo.id}` for full, `${photo.id}-thumb` for thumbnail) to share the disk cache with the feed's ImageView
- Add `isValidImageUri` guard for both URLs, matching the ImageView pattern

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `quick-actions-modal`: Add progressive image loading requirement — thumbnail loads first, full image loads on top

## Impact

- **Code**: `src/components/QuickActionsModal/index.js` — replace `Image` import with `CachedImage` from `expo-cached-image`, add `ActivityIndicator` import, add `isValidImageUri` utility import, restructure the image rendering section
- **Dependencies**: No new dependencies (`expo-cached-image` is already installed)
- **UX**: Users see spinner → thumbnail → full image in the long-press preview, matching the expanded photo view behavior. Repeated long-presses on the same photo are instant due to disk caching.
