## 1. FeedModeToggleFAB repositioning

- [x] 1.1 Change `FeedModeToggleFAB` style from `right: HORIZONTAL_MARGIN` to `left: HORIZONTAL_MARGIN`
- [x] 1.2 Change `FeedModeToggleFAB` bottom from `footerHeight + FAB_SIZE + 12 + HORIZONTAL_MARGIN` to `footerHeight + HORIZONTAL_MARGIN` (same vertical baseline as SearchFab)

## 2. SearchFab repositioning — wrapper and bar anchor

- [x] 2.1 Add `GAP = 8` constant for spacing between Bookmarks FAB and SearchFab bar
- [x] 2.2 Change bar anchor from `right: 0` to `left: FAB_SIZE + GAP` (64px offset for bookmarks FAB)
- [x] 2.3 Update collapsed bar width: `FAB_SIZE` (unchanged)
- [x] 2.4 Update expanded bar width calculation: `screenWidth - HORIZONTAL_MARGIN - (FAB_SIZE + GAP)`
- [x] 2.5 Update `barStyle` animated width interpolation: `[FAB_SIZE, newExpandedWidth]`

## 3. SearchFab repositioning — input padding and FAB slide direction

- [x] 3.1 Swap input padding interpolation so collapsed has `paddingLeft: 16, paddingRight: FAB_SIZE + 4` (FAB on left) and expanded has `paddingLeft: FAB_SIZE + 4, paddingRight: 16` (FAB on right)
- [x] 3.2 Update FAB `translateX` interpolation from `[0, -(expandedWidth - FAB_SIZE)]` to `[0, expandedWidth - FAB_SIZE]` (slides left-to-right instead of right-to-left)

## 4. Verify all render paths

- [ ] 4.1 Test main render path (ExpoMasonryLayout) — both FABs visible, correct positions
- [ ] 4.2 Test empty state render path (ScrollView + EmptyStateCard) — both FABs visible, correct positions
- [ ] 4.3 Test loading state render path (ScrollView) — both FABs visible, correct positions
- [ ] 4.4 Test keyboard lift behavior — both FABs lift together with the keyboard
- [ ] 4.5 Test expand/collapse animation on device — spring animation reads naturally
