## 1. Enable auto-scroll on expand

- [x] 1.1 In `src/screens/PhotosList/components/PhotosListMasonry.js`, add `autoScrollOnExpand={{ animated: true, viewOffset: 8 }}` prop to the `<ExpoMasonryLayout>` component

## 2. Fix scroll-to-top FOB compatibility

- [x] 2.1 In `src/screens/PhotosList/components/PhotosListMasonry.js`, update `handleScrollToTop` to call `masonryRef.current.scrollToOffset(0, { animated: true })` instead of `masonryRef.current.scrollToOffset({ offset: 0, animated: true })`

## 3. Clean up dead code

- [x] 3.1 In `src/screens/PhotosList/hooks/usePhotoExpansion.js`, remove the dead `handleScroll` no-op callback and remove it from the hook's return object

## 4. Verify

- [x] 4.1 Open the home feed, tap a thumbnail — confirm the feed scrolls so the expanded photo is near the top of the viewport
- [x] 4.2 Tap the collapse button — confirm the feed scrolls to keep the collapsed thumbnail visible
- [x] 4.3 Scroll down past 200px, confirm the scroll-to-top FOB appears, tap it — confirm smooth scroll to top
- [x] 4.4 Open BookmarksList, FriendDetail, and WaveDetail screens — confirm the same expand/scroll behavior works on each
