## Why

The packages `expo-cached-image`, `expo-storage`, and `expo-masonry-layout` are currently pinned to older versions (54.x / 1.1.x) and need to be updated to their latest releases to pick up bug fixes, performance improvements, and compatibility with the current Expo 55 SDK. Additionally, `expo-image` is listed as a dependency but is not imported or used anywhere in the codebase — it should be removed to reduce bundle size and avoid confusion.

## What Changes

- Update `expo-cached-image` from `54.0.7` to the latest version
- Update `expo-storage` from `54.0.8` to the latest version
- Update `expo-masonry-layout` from `1.1.11` to the latest version
- Remove unused `expo-image` dependency (`55.0.6`)

## Capabilities

### New Capabilities

_None — this is a dependency maintenance change._

### Modified Capabilities

_None — no spec-level behavior changes. The same APIs are used; only package versions change._

## Impact

- **package.json**: Version bumps for 3 packages, removal of 1 package
- **node_modules**: Updated after `npm install`
- **Files using expo-cached-image** (6 files): `CachedImage` and `CacheManager` imports — should continue working with updated API
  - `src/components/Photo/PinchableView.js`
  - `src/components/Photo/ImageView.js`
  - `src/components/ExpandableThumb/index.js`
  - `src/screens/Chat/ChatPhoto.js`
  - `src/screens/ModalInputText/index.js`
  - `src/screens/PhotosList/upload/photoUploadService.js`
  - `src/screens/Chat/reducer.js`
- **Files using expo-storage** (3 files): `Storage` import — should continue working
  - `src/screens/FriendsList/friends_helper.js`
  - `src/screens/Chat/reducer.js`
  - `src/screens/PhotosList/upload/photoUploadService.js`
- **Files using expo-masonry-layout** (1 file): `ExpoMasonryLayout` import
  - `src/screens/PhotosList/components/PhotosListMasonry.js`
- **expo-image**: No source files import it — safe to remove
