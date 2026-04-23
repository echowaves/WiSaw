## 1. Remove Modal Infrastructure

- [x] 1.1 Delete `app/photo-detail.tsx` modal route file
- [x] 1.2 Remove `photoDetailAtom` export from `src/state.js`
- [x] 1.3 Remove `photo-detail` Stack.Screen entry from `app/_layout.tsx`

## 2. Expansion State Management

- [x] 2.1 Rewrite `usePhotoExpansion` hook to manage `expandedPhotoId` state (string | null), `expandedHeightsCache` ref (Map<string, number>), and expose `{ expandedItemIds, getExpandedHeight, toggleExpand, handleScroll, masonryRef }`
- [x] 2.2 Implement `getExpandedHeight(item, fullWidth)` — read from cache if available, otherwise compute `imageHeight + ACTION_BAR_HEIGHT + COMMENTS_ESTIMATE + PADDING`
- [x] 2.3 Implement `toggleExpand(itemId)` — if same ID, collapse (set null); if different, collapse current and expand new
- [x] 2.4 Add `updateExpandedHeight(itemId, measuredHeight)` — update cache and re-trigger layout when height differs from current by more than a threshold (e.g., 10px)

## 3. PhotosListMasonry Integration

- [x] 3.1 Accept `expandedItemIds`, `getExpandedHeight`, and `toggleExpand` as props in `PhotosListMasonry`
- [x] 3.2 Pass `expandedItemIds` and `getExpandedHeight` to `ExpoMasonryLayout` component
- [x] 3.3 Update `renderMasonryItem` to check `isExpanded` from render info — when true, render `<Photo>` wrapped in `PhotosListContext.Provider`; when false, render `<ExpandableThumb>`
- [x] 3.4 Remove `handlePhotoPress` / `setPhotoDetail` / `router.push('/photo-detail')` logic
- [x] 3.5 Remove `photoDetailAtom` import from `PhotosListMasonry`

## 4. ExpandableThumb Updates

- [x] 4.1 Change `onPress` prop to call `toggleExpand(item.id)` instead of navigating to modal
- [x] 4.2 Verify collapsed thumbnail rendering is unchanged (no regression)

## 5. Photo Component in Expanded View

- [x] 5.1 In `renderMasonryItem`, when `isExpanded` is true, render `<Photo embedded={true} photo={item} onHeightMeasured={(h) => updateExpandedHeight(item.id, h)} />`
- [x] 5.2 Wrap the expanded Photo in `<PhotosListContext.Provider value={{ removePhoto }}>`
- [x] 5.3 Add a collapse button/affordance to the expanded view (e.g., chevron-up icon at the top or reuse close button behavior)

## 6. Parent Screen Wiring

- [x] 6.1 Update `PhotosList/index.js` — destructure expanded props from `usePhotoExpansion()` and pass to `PhotosListMasonry`
- [x] 6.2 Update `BookmarksList/index.js` — same pattern
- [x] 6.3 Update `WaveDetail/index.js` — same pattern
- [x] 6.4 Update `FriendDetail/index.js` — same pattern

## 7. Height Constants

- [x] 7.1 Define height estimation constants in `photoListHelpers.js`: `EXPANDED_ACTION_BAR_HEIGHT`, `EXPANDED_COMMENTS_ESTIMATE`, `EXPANDED_PADDING`
- [x] 7.2 Export a helper `estimateExpandedHeight(item, fullWidth)` that computes image height from aspect ratio + fixed chrome

## 8. Cleanup

- [x] 8.1 Remove unused `router` import from `PhotosListMasonry` (if no longer needed)
- [x] 8.2 Remove unused `useSetAtom` / `jotai` imports from `PhotosListMasonry`
- [x] 8.3 Verify `Photo/index.js` close button logic — `embedded={true}` should hide the close button (we flipped this earlier, confirm it's correct for inline use)

## 9. Manual Verification

- [x] 9.1 Tap thumbnail → photo expands inline at full width with detail view
- [x] 9.2 Tap collapse control → photo collapses back to thumbnail
- [x] 9.3 Tap another thumbnail while one is expanded → first collapses, second expands
- [x] 9.4 Comments and photo details load correctly in expanded view
- [x] 9.5 Height correction works — expanded view adjusts after async content loads
- [x] 9.6 Bookmarked segment still shows comment sections below thumbnails
- [x] 9.7 Friend detail, wave detail, and bookmarks screens all expand inline
- [x] 9.8 Feed scroll position is reasonable after expand/collapse cycle
- [x] 9.9 No duplicate React error (metro config still working)
- [x] 9.10 Long-press context menu still works on collapsed thumbnails
