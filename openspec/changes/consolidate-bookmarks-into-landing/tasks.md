## 1. State management

- [x] 1.1 Add `isBookmarksMode` Jotai atom to `src/state.js` (boolean, default `false`)

## 2. FeedModeToggleFAB component

- [x] 2.1 Create `src/components/FeedModeToggleFAB/index.js` with FAB (56x56, right-aligned)
- [x] 2.2 Implement icon swap logic: `globe-outline` ↔ `bookmark-outline` based on `isBookmarksMode`
- [x] 2.3 Wire toggle handler to flip `isBookmarksMode` and trigger `reload()`
- [x] 2.4 Add haptic feedback on tap via `Haptics.impactAsync`
- [x] 2.5 Position FAB at `right: 16`, `bottom: FOOTER_HEIGHT + 84` with proper z-index

## 3. SearchFab repositioning

- [x] 3.1 Change `SearchFab` from left-aligned to right-aligned (`right: 16` instead of left)
- [x] 3.2 Update expand animation FAB button slide direction (right edge → left edge when expanding)
- [x] 3.3 Ensure expand animation doesn't conflict with FeedModeToggleFAB above it

## 4. PhotosList layout unification

- [x] 4.1 Import `BOOKMARK_LAYOUT_CONFIG` instead of `GEO_FEED_LAYOUT_CONFIG` in PhotosList
- [x] 4.2 Change columns from feed profile to comment-screen profile (`{ 402: 2, 440: 3, 834: 5, 1024: 7, default: 9 }`)
- [x] 4.3 Pass `activeSegment={1}` always to PhotosListMasonry to enable comments on thumbnails
- [x] 4.4 Remove segment-based `shouldShowComments` conditional (comments always shown when applicable)

## 5. PhotosList feed mode integration

- [x] 5.1 Read `isBookmarksMode` atom in PhotosList
- [x] 5.2 Derive `activeSegment` from `isBookmarksMode` (`isBookmarksMode ? 1 : 0`)
- [x] 5.3 Switch `fetchFn` for `useFeedLoader` based on mode (`requestGeoPhotos` vs `requestWatchedPhotos`)
- [x] 5.4 Add `useEffect` to reload feed when `isBookmarksMode` changes
- [x] 5.5 Handle bookmarks mode with location denied/pending (feed loads without location)
- [x] 5.6 Preserve search term across mode toggles

## 6. FAB rendering in PhotosList

- [x] 6.1 Render `FeedModeToggleFAB` above `SearchFab` in the content state
- [x] 6.2 Hide both FABs in offline and T&C-not-accepted states
- [x] 6.3 Render both FABs in empty state and loading states

## 7. Remove Bookmarks screen and drawer item

- [x] 7.1 Remove `<Drawer.Screen name='bookmarks'>` from `app/(drawer)/_layout.tsx`
- [x] 7.2 Delete `BookmarksDrawerIcon` component from `_layout.tsx`
- [x] 7.3 Delete `app/(drawer)/bookmarks.tsx`
- [x] 7.4 Delete `src/screens/BookmarksList/index.js`

## 8. Cleanup

- [x] 8.1 Remove `GEO_FEED_LAYOUT_CONFIG` from `src/consts.js`
- [x] 8.2 Update `PhotosListMasonry` default `FEED_COLUMNS` to match comment-screen profile
- [x] 8.3 Remove BookmarksList references from existing specs (appheader-loading, fab-visibility-control, global-upload-banner, inline-expand, pagination-hook, pinch-modal-navigation, thumb-comment-section)
