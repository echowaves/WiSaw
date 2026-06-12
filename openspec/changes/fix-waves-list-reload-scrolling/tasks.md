## 1. Implementation

- [x] 1.1 Add `userHasScrolled.current = false` reset to the `useEffect` that watches `initialPhotos` in `/src/components/WavePhotoStrip/index.js`
- [x] 1.2 Add `setAutoScrollTrigger(false)` reset to the same `useEffect` in `/src/components/WavePhotoStrip/index.js`
- [x] 1.3 Verify the `useEffect` runs with correct dependencies (`[initialPhotos]`)
- [x] 1.4 Test the fix by reloading the waves list after uploading a photo
- [x] 1.5 Test that auto-scroll still works during normal pagination (user scrolls to end, loads next page)

## 2. Verification

- [x] 2.1 Verify wave cards on the waves list start at scroll position 0 after reload
- [x] 2.2 Verify wave cards show correct photos without horizontal offset
- [x] 2.3 Verify auto-scroll to end still occurs during normal pagination
- [x] 2.4 Verify no regression in friend cards (also use WavePhotoStrip)
- [x] 2.5 Verify no regression in ungrouped photos card (also use WavePhotoStrip)
