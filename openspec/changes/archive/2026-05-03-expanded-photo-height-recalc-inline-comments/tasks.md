## 1. Upgrade Library and Remove Client-Side Height Pipeline

- [x] 1.1 Upgrade `expo-masonry-layout` to latest version with auto-measurement support (`npm install --save-exact expo-masonry-layout@latest`)
- [x] 1.2 Remove `onHeightMeasured` prop from `<Photo>` in `PhotosListMasonry.js` `renderMasonryItem` — the library auto-measures expanded cells
- [x] 1.3 Remove `updateExpandedHeight` from `usePhotoExpansion.js` — delete the function, `expandedHeightsCache` ref, `correctionCounts` ref, `layoutVersion` state, and all constants (`HEIGHT_CHANGE_THRESHOLD`, `MAX_CORRECTIONS`, `LARGE_CHANGE_THRESHOLD`)
- [x] 1.4 Update `getExpandedHeight` in `usePhotoExpansion.js` to always return the aspect-ratio estimate (no cache lookup, no `layoutVersion` dependency) — the library auto-corrects after render
- [x] 1.5 Remove `updateExpandedHeight` from the return value of `usePhotoExpansion` and its prop threading through `PhotosListMasonry`
- [x] 1.6 Remove `scheduleHeightRecalc()` function and `containerRef` from `Photo/index.js` — delete the function definition, the ref, and all calls to it (in AI toggle handlers and photoDetails load effect)
- [x] 1.7 Remove `onHeightMeasured` prop handling from `Photo/index.js` — delete the prop destructuring, the `onLayout` guard for embedded mode, and the prop type declaration

## 2. Inline Comment Input

- [x] 2.1 Add `showCommentInput` boolean state to the Photo component, initialized to `false`
- [x] 2.2 Add `commentInputText` string state to the Photo component for the inline input value
- [x] 2.3 Modify `renderAddCommentsRow()` to conditionally render inline `TextInput` + send button when `embedded && showCommentInput`, otherwise render the existing "Add Comment" button
- [x] 2.4 Wire the "Add Comment" button `onPress` to set `showCommentInput = true` when `embedded === true`, keeping `router.push('/modal-input')` for `embedded === false`
- [x] 2.5 Set `autoFocus={true}` on the inline `TextInput` so the keyboard opens immediately
- [x] 2.6 Implement inline submit handler: call `reducer.submitComment()`, add optimistic comment via `setOptimisticComment`, emit `photoRefreshBus` event, clear input text, set `showCommentInput = false`
- [x] 2.7 Handle dismiss on blur: set `showCommentInput = false` and clear input text when the `TextInput` loses focus without submitting
- [x] 2.8 Preserve frozen wave guard: show toast and prevent inline input from appearing when `photo.waveIsFrozen && photo.waveViewerRole !== 'owner'`
- [x] 2.9 Style the inline input row to match the existing "Add Comment" card appearance — themed background, consistent padding, send icon button

## 3. Verification

- [x] 3.1 Verify bookmark toggle triggers auto-relayout (expanded cell height updates without client-side intervention)
- [x] 3.2 Verify comment metadata expand/collapse triggers auto-relayout
- [x] 3.3 Verify comment deletion triggers auto-relayout (cell shrinks)
- [x] 3.4 Verify AI section toggle triggers auto-relayout
- [x] 3.5 Test on iOS and Android that keyboard scroll-to-input works correctly when the inline TextInput is focused inside an expanded masonry cell
