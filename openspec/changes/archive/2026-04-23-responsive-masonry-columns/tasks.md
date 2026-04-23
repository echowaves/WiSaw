## 1. PhotosListMasonry columns prop

- [x] 1.1 Add `columns` prop to `PhotosListMasonry` component with default value `{ 402: 3, 440: 4, 834: 7, 1024: 9, default: 12 }`
- [x] 1.2 Replace hardcoded `columns={2}` on `ExpoMasonryLayout` with the `columns` prop

## 2. Parent screens pass column configs

- [x] 2.1 In `PhotosList/index.js`, pass feed column config `{ 402: 3, 440: 4, 834: 7, 1024: 9, default: 12 }` as `columns` prop to `PhotosListMasonry`
- [x] 2.2 In `BookmarksList/index.js`, pass comment-screen column config `{ 402: 2, 440: 3, 834: 5, 1024: 7, default: 9 }` as `columns` prop to `PhotosListMasonry`
- [x] 2.3 In `WaveDetail/index.js`, pass comment-screen column config `{ 402: 2, 440: 3, 834: 5, 1024: 7, default: 9 }` as `columns` prop to `PhotosListMasonry`
- [x] 2.4 In `FriendDetail/index.js`, pass comment-screen column config `{ 402: 2, 440: 3, 834: 5, 1024: 7, default: 9 }` as `columns` prop to `PhotosListMasonry`

## 3. Remove dead responsive column code

- [x] 3.1 In `PhotosList/index.js`, remove `getResponsiveColumns` function and `maxItemsPerRow` from `segmentConfig`
- [x] 3.2 In `BookmarksList/index.js`, remove `getResponsiveColumns` function and `maxItemsPerRow` from `segmentConfig`
- [x] 3.3 In `WaveDetail/index.js`, remove `getResponsiveColumns` function and `maxItemsPerRow` from `segmentConfig`
- [x] 3.4 In `FriendDetail/index.js`, remove `getResponsiveColumns` function and `maxItemsPerRow` from `segmentConfig`
