## 1. Replace Image with progressive CachedImage loading

- [x] 1.1 In `src/components/QuickActionsModal/index.js`, replace the `Image` import with `CachedImage` from `expo-cached-image`, add `ActivityIndicator` import, and add `isValidImageUri` import from `../../utils/isValidImageUri`
- [x] 1.2 Replace the single `<Image source={{ uri: photo.thumbUrl }}>` with the two-layer progressive loading pattern: thumbnail CachedImage (zIndex: 1) with ActivityIndicator placeholder, and full-resolution CachedImage (zIndex: 2) — guarded by `isValidImageUri` checks
- [x] 1.3 Update the `thumbnail` style to use `position: 'relative'` as a container, and add an absolute-positioned overlay style for both image layers

## 2. Verify

- [x] 2.1 Run Codacy analysis on the modified file
