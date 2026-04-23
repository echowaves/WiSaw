## 1. Foundation: State Atom and Modal Route

- [x] 1.1 Add `photoDetailAtom` to `src/state.js` — `atom(null)` with shape `{ photo, removePhoto }` when active
- [x] 1.2 Create `app/photo-detail.tsx` — fullScreenModal route that reads `photoDetailAtom`, wraps in `PhotosListContext.Provider`, renders `<Photo embedded={false} />`, guards against null atom, clears atom on unmount
- [x] 1.3 Register `photo-detail` in `app/_layout.tsx` as `Stack.Screen` with `presentation: 'fullScreenModal'`, `headerShown: false`

## 2. Comment Section Constants

- [x] 2.1 Define `COMMENT_SECTION_HEIGHT = 44` in `src/utils/photoListHelpers.js` and export it

## 3. PhotosListMasonry: Column Mode and Simplified Props

- [x] 3.1 Add `layoutMode='column'` and `columns={2}` props to `ExpoMasonryLayout` in `PhotosListMasonry`
- [x] 3.2 Remove `getItemDimensions` prop from `ExpoMasonryLayout` — column mode calculates dimensions from item aspect ratios
- [x] 3.3 Add `getExtraHeight` prop that returns `COMMENT_SECTION_HEIGHT` when `activeSegment === 1` and item has comments/watchers/lastComment, 0 otherwise
- [x] 3.4 Update `renderMasonryItem` to receive and pass `extraHeight` to `ExpandableThumb`; remove dimension correction logic
- [x] 3.5 Replace expansion-related props in `renderMasonryItem` with `onPress` callback that sets `photoDetailAtom` and calls `router.push('/photo-detail')`
- [x] 3.6 Remove expansion-related props from `PhotosListMasonry` component signature (`isPhotoExpanded`, `expandedPhotoIds`, `onToggleExpand`, `updatePhotoHeight`, `onRequestEnsureVisible`, `justCollapsedId`, `getCalculatedDimensions`)
- [x] 3.7 Update `keyExtractor` to remove expanded/collapsed suffix — use `item.id` only

## 4. ExpandableThumb: Collapse-Only Thumbnail

- [x] 4.1 Remove all expansion-related state from `ExpandableThumb` (`isExpanded`, `expandedPhotoIds`, `onToggleExpand`, `expandValue`, `isAnimating`, `originalDimensions`, `finalWidth`, `finalHeight` logic)
- [x] 4.2 Remove `renderExpandedPhoto()` function and the `Photo` component import
- [x] 4.3 Remove `global.expandableThumbCallbacks` and `global.expandableThumbMinimize` registry and cleanup
- [x] 4.4 Remove `handleHeightMeasured`, `onUpdateDimensions`, `updatePhotoHeight` height-tracking logic
- [x] 4.5 Remove `ensureItemVisible` / `onRequestEnsureVisible` / `shouldScrollToTop` scroll-anchoring logic
- [x] 4.6 Replace `onThumbPress` with `onPress` prop callback (provided by PhotosListMasonry)
- [x] 4.7 Accept `extraHeight` prop; split `thumbHeight` into image height (`thumbHeight - extraHeight`) and comment section height
- [x] 4.8 Replace `renderCommentOverlay()` with `renderCommentSection()` — normal-flow View below image, 44px height, theme-aware background, 1-line truncated last comment + stat icons
- [x] 4.9 Update `renderCollapsedThumb()` layout — image wrapper with conditional bottom radius when comments shown, ⋮ pill positioned within image wrapper, comment section as sibling below
- [x] 4.10 Import `COMMENT_SECTION_HEIGHT` from `photoListHelpers`; use theme colors (`TEXT_PRIMARY`, `TEXT_SECONDARY`, `CARD_BACKGROUND`) for comment section

## 5. usePhotoExpansion: Simplify or Eliminate

- [x] 5.1 Remove expansion state from `usePhotoExpansion` — `expandedPhotoIds`, `setExpandedPhotoIds`, `isPhotoExpanding`, `measuredHeights`, `photoHeightRefs`, `justCollapsedId`, `scrollToIndex`
- [x] 5.2 Remove expansion methods — `handlePhotoToggle`, `isPhotoExpanded`, `getCalculatedDimensions`, `updatePhotoHeight`, `ensureItemVisible`
- [x] 5.3 Keep only: `masonryRef`, `handleScroll` (for FOB), `performScroll` (for scroll-to-top), `resetAnchorState` (simplified for segment switching)
- [x] 5.4 Update return value to only export kept items; remove expansion-related exports

## 6. Parent Screen Wiring: Remove Expansion Props

- [x] 6.1 Update `src/screens/PhotosList/index.js` — remove expansion prop wiring to `PhotosListMasonry`, pass `removePhoto` for modal use
- [x] 6.2 Update `src/screens/BookmarksList/index.js` — remove expansion prop wiring, pass `removePhoto`
- [x] 6.3 Update `src/screens/WaveDetail/index.js` — remove expansion prop wiring, remove manual expansion state, pass `removePhoto`
- [x] 6.4 Update `src/screens/FriendDetail/index.js` — remove expansion prop wiring, pass `removePhoto`

## 7. Photo Component: Close Button Update

- [x] 7.1 Update close button in `src/components/Photo/index.js` — remove `global.expandableThumbMinimize` check, use `router.back()` directly for `embedded` mode

## 8. Cleanup

- [x] 8.1 Remove `calculatePhotoDimensions` from `photoListHelpers.js` if no longer used (verify no other callers)
- [x] 8.2 Remove dead expansion-related imports and unused code across all modified files
- [x] 8.3 Verify no TypeScript or lint errors across all modified files

## 9. Verification

- [ ] 9.1 Verify column masonry layout renders correctly in global feed (segment 0) — photos at natural aspect ratios, 2 columns
- [ ] 9.2 Verify bookmarked segment (segment 1) shows comment sections below thumbnails with correct height, theme colors, truncated text
- [ ] 9.3 Verify tapping a thumbnail opens `/photo-detail` modal with full Photo component — image, comments, actions all work
- [ ] 9.4 Verify closing the modal returns to the grid with scroll position preserved
- [ ] 9.5 Verify deleting a photo in the modal removes it from the underlying grid
- [ ] 9.6 Verify ⋮ pill visible and tappable, positioned on image area above comment section
- [ ] 9.7 Verify long-press opens QuickActionsModal from all screens
- [ ] 9.8 Verify dark mode renders correctly — comment sections, modal, thumbnails
- [ ] 9.9 Verify WaveDetail and FriendDetail screens use column masonry and modal navigation
- [ ] 9.10 Verify scroll-to-top FOB still works in all screens
