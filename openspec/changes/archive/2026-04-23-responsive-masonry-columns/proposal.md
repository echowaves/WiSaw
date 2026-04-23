## Why

Thumbnails are hardcoded to 2 columns across all screens regardless of device size. On tablets, this makes each thumb ~370-510px wide, far exceeding the native thumbnail resolution (300px height, ~225-400px width depending on aspect ratio). The result is blurry, upscaled images on larger screens. Conversely, 2 columns wastes screen real estate on tablets that could fit 7-9 columns of crisp ~110px thumbnails.

## What Changes

- Replace hardcoded `columns={2}` in `PhotosListMasonry` with a `columns` prop accepting responsive breakpoint configs via the existing `ColumnsConfig` type in expo-masonry-layout (`number | { default: number, [breakpoint: number]: number }`)
- Feed screen (PhotosList) uses dense grid targeting ~110px thumbs: `{ 402: 3, 440: 4, 834: 7, 1024: 9, default: 12 }`
- Comment screens (BookmarksList, WaveDetail, FriendDetail) use wider columns for comment readability: `{ 402: 2, 440: 3, 834: 5, 1024: 7, default: 9 }`
- Each parent screen passes its column config to `PhotosListMasonry`
- Remove dead `getResponsiveColumns` and `maxItemsPerRow` code from all 4 screen configs (only applied to unused row layout mode)

## Capabilities

### New Capabilities
- `responsive-columns`: Responsive column breakpoint configuration for masonry grid layout, adapting column count to screen width to maintain optimal thumbnail display size

### Modified Capabilities
- `photo-feed`: PhotosListMasonry accepts a `columns` prop instead of hardcoding `columns={2}`
- `starred-screen`: BookmarksList passes comment-screen column config
- `wave-detail`: WaveDetail passes comment-screen column config
- `friend-photo-feed`: FriendDetail passes comment-screen column config

## Impact

- `src/screens/PhotosList/components/PhotosListMasonry.js`: Add `columns` prop, replace hardcoded value
- `src/screens/PhotosList/index.js`: Pass feed column config, remove dead `getResponsiveColumns`/`maxItemsPerRow`
- `src/screens/BookmarksList/index.js`: Pass comment-screen column config, remove dead code
- `src/screens/WaveDetail/index.js`: Pass comment-screen column config, remove dead code
- `src/screens/FriendDetail/index.js`: Pass comment-screen column config, remove dead code
- No backend changes needed
- No library changes needed — expo-masonry-layout already supports `ColumnsConfig` via `resolveColumnCount()`
