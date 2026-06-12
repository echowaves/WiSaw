## 1. Add FlatList ref and hadPhotos guard to WavePhotoStrip

- [x] 1.1 In `src/components/WavePhotoStrip/index.js`, add `const flatListRef = useRef(null)`
- [x] 1.2 In `src/components/WavePhotoStrip/index.js`, add `const prevPhotosLengthRef = useRef(0)` — tracks photos count before each fetch
- [x] 1.3 In `src/components/WavePhotoStrip/index.js`, pass `ref={flatListRef}` to the `FlatList` component

## 2. Add auto-scroll-to-end after photos load

- [x] 2.1 In `src/components/WavePhotoStrip/index.js`, added a `useEffect` watching `photos` that detects when new photos are appended (photos.length > prevPhotosLengthRef.current)
- [x] 2.2 In `src/components/WavePhotoStrip/index.js`, the `useEffect` checks if photos were added AND prevPhotosLengthRef.current > 0 (not first load), then calls `flatListRef.current?.scrollToEnd({ animated: false })`
- [x] 2.3 In `src/components/WavePhotoStrip/index.js`, the ref is updated at the end of the effect: `prevPhotosLengthRef.current = photos.length`, which naturally tracks the previous count

## 3. Guard auto-scroll on first load from empty state

- [x] 3.1 Auto-scroll is guarded by `prevPhotosLengthRef.current > 0` in the useEffect — this naturally skips auto-scroll when the strip starts empty (0 initial photos) and loads the first page

## 4. Verification

- [ ] 4.1 Open a wave card with 3–4 initial photos → scroll the photo strip right → verify page 1 loads → verify auto-scroll keeps user at the new end
- [ ] 4.2 Continue scrolling right → verify page 2 loads → verify auto-scroll continues to work seamlessly
- [ ] 4.3 Open a wave card with 0 initial photos → verify page 0 loads → verify NO auto-scroll jump occurs
- [ ] 4.4 After page loads, try tapping a photo → verify tap is not interrupted by auto-scroll
- [ ] 4.5 Long-press a photo → verify long-press is not interrupted by auto-scroll
- [ ] 4.6 Verify the `stopLoading.current` guard prevents double-fetches during the brief window after auto-scroll
