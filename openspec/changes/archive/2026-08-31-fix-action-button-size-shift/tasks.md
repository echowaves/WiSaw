## 1. Fix shared component styles

- [x] 1.1 In `src/components/PhotoActionButtons/index.js`, remove `minWidth: 32` and `borderRadius: 16` from the `actionButtonDisabled` style (keep `backgroundColor`, `borderColor`, `opacity`, `shadowOpacity`, `elevation`)

## 2. Wave button layout

- [x] 2.1 Restructure `PhotoActionButtons` into two rows: row 1 = Report, Delete, Bookmark, Share (existing wrapping row); row 2 = full-width centered row containing only the Wave button (last element)
- [x] 2.2 Give the Wave button a fixed `width` (120, replacing `minWidth` inheritance for this button) and add `ellipsizeMode='tail'` + `flexShrink: 1` to its label `Text` so long wave names truncate inside the fixed frame

## 3. Verification

- [x] 3.1 Verify in the photo preview overlay (long-press a feed photo → quick-actions modal): bookmark/unbookmark a photo and confirm Report, Delete, and Share buttons do not change size or position
- [x] 3.2 Verify in the expanded photo view (expand a photo in the feed): bookmark/unbookmark and confirm no button reflow/shift
- [x] 3.3 Verify disabled buttons still render de-emphasized (muted colors, reduced opacity) and remain non-interactive
- [x] 3.4 Verify the Wave button is last and on its own line in both views, keeps a fixed width when details load ("Add to Wave" → wave name), and truncates a long wave name with an ellipsis
- [x] 3.5 Verify the Wave button is still disabled on other users' photos and opens the WaveSelectorModal on own photos
