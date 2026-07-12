## Why

The pending upload indicator is currently wired manually into individual screens (PhotosList, WaveDetail, WavesHub) but missing from BookmarksList and FriendsList. Users who take a photo then navigate to bookmarks or friends see no feedback about pending uploads. Screen-by-screen wiring is fragile — every new screen risks forgetting the banner.

## What Changes

- **New**: `GlobalUploadBanner` component — a fixed-position overlay that reads `UploadContext` and `netAvailable` directly, always visible at the top of the screen when uploads are pending.
- **New**: `bannerHeightAtom` — a Jotai atom publishing the banner's visible height so all screens can add dynamic padding.
- **Modified**: `UploadProvider` mounts the global banner alongside the Drawer in `app/(drawer)/_layout.tsx`.
- **Modified**: All screens (PhotosList, WaveDetail, WavesHub, BookmarksList, FriendsList) consume `bannerHeightAtom` for top padding instead of rendering the banner inline.
- **Removed**: `PendingPhotosBanner` component and `usePendingAnimation` hook — dead code replaced by the global banner.

## Capabilities

### New Capabilities

- `global-upload-banner`: Fixed-position upload status banner visible across all drawer screens, with automatic height coordination via Jotai atom.

### Modified Capabilities

- `upload-orchestration`: UI consumption model changes from per-screen inline rendering to a single global overlay. The upload context itself (queue, processing, provider) is unchanged.

## Impact

- `src/contexts/UploadContext.js` — banner mounts here
- `app/(drawer)/_layout.tsx` — banner rendered alongside Drawer
- `src/state.js` — new `bannerHeightAtom`
- `src/components/GlobalUploadBanner/index.js` — new component (replaces PendingPhotosBanner)
- `src/screens/PhotosList/index.js` — remove 6 inline banner renders + `usePendingAnimation`
- `src/screens/WaveDetail/index.js` — remove inline banner
- `src/screens/WavesHub/index.js` — remove inline banner
- `src/screens/BookmarksList/index.js` — add bannerHeightAtom padding
- `src/screens/FriendsList/index.js` — add bannerHeightAtom padding
- `src/screens/PhotosList/components/PendingPhotosBanner.js` — deleted
- `src/hooks/usePendingAnimation.js` — deleted
