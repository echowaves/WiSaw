## 1. Extract low-coupling hooks (no shared state dependencies)

- [x] 1.1 Create `src/screens/PhotosList/hooks/useNetworkStatus.js` — extract NetInfo subscription and `netAvailable` state from index.js
- [x] 1.2 Create `src/screens/PhotosList/hooks/useKeyboardTracking.js` — extract `useKeyboard`, platform-specific keyboard listeners, `keyboardVisible`, `dismissKeyboard`, and `keyboardOffset` from index.js
- [x] 1.3 Create `src/screens/PhotosList/hooks/useLocationInit.js` — extract `location`, `setLocation`, `initLocation`, and `checkPermission` (for location only) from index.js

## 2. Extract animation hook

- [x] 2.1 Create `src/screens/PhotosList/hooks/usePendingAnimation.js` — extract `pendingPhotosAnimation`, `uploadIconAnimation`, `previousPendingCount`, and the animation useEffect from index.js

## 3. Extract camera hook

- [x] 3.1 Create `src/screens/PhotosList/hooks/useCameraCapture.js` — extract `isCameraOpening`, `checkPermission` (for camera/media), `takePhoto`, and `checkPermissionsForPhotoTaking` from index.js

## 4. Extract photo expansion hook (largest extraction)

- [x] 4.1 Create `src/screens/PhotosList/hooks/usePhotoExpansion.js` — extract `expandedPhotoIds`, `isPhotoExpanding`, `measuredHeights`, `justCollapsedId`, `scrollToIndex`, all anchor/scroll refs, `handlePhotoToggle`, `isPhotoExpanded`, `getCalculatedDimensions`, `updatePhotoHeight`, `ensureItemVisible`, `performScroll`, `resetAnchorState`, `handleScroll`, `masonryRef`, and the scrollToIndex cleanup useEffect from index.js

## 5. Extract header component

- [x] 5.1 Create `src/screens/PhotosList/components/PhotosListHeader.js` — extract `renderCustomHeader` into a standalone component accepting `{ theme, activeSegment, updateIndex, loading, segmentWidth, styles }` as props

## 6. Rewire index.js orchestrator

- [x] 6.1 Update `src/screens/PhotosList/index.js` — import all new hooks and `PhotosListHeader`, replace inline code with hook calls, replace `renderCustomHeader()` with `<PhotosListHeader />`, and remove all extracted code
- [x] 6.2 Verify all render branches still pass the correct props to child components after rewiring

## 7. Verification

- [x] 7.1 Run the app and verify all three segments (Global, Starred, Search) load and display photos correctly
- [x] 7.2 Verify photo expansion/collapse works with scroll-to-visible behavior
- [x] 7.3 Verify camera capture flow works (permissions, photo, video)
- [x] 7.4 Verify offline banner, pending-photos animation, and upload resume work
- [x] 7.5 Confirm `index.js` NLOC is below 600 lines
