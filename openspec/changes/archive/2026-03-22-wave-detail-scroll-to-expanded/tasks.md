## 1. Replace Manual Expansion State with usePhotoExpansion Hook

- [x] 1.1 Import `usePhotoExpansion` from `../../PhotosList/hooks/usePhotoExpansion` in WaveDetail
- [x] 1.2 Call `usePhotoExpansion` with WaveDetail's `{ width, height, insets, segmentConfig }` and destructure all returned values
- [x] 1.3 Remove manual expansion state declarations replaced by the hook (expandedPhotoIds, setExpandedPhotoIds, isPhotoExpanding, measuredHeights, justCollapsedId, photoHeightRefs, lastExpandedIdRef, and related inline functions: handlePhotoToggle, isPhotoExpanded, getCalculatedDimensions, updatePhotoHeight)

## 2. Wire Scroll Props to PhotosListMasonry

- [x] 2.1 Pass `onRequestEnsureVisible={ensureItemVisible}` to PhotosListMasonry in WaveDetail
- [x] 2.2 Pass `onScroll={handleScroll}` to PhotosListMasonry in WaveDetail
- [x] 2.3 Replace WaveDetail's local `masonryRef` with the one returned by the hook (so performScroll targets the correct ref)
