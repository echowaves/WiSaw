# Tasks — Clickable Tag Search

## 1. Wire the expanded card in the feed

- [x] 1.1 In `src/components/PhotosListMasonry/index.js`, pass `onTriggerSearch` to the expanded `<Photo>` in the `isExpanded` branch of `renderMasonryItem`, and add `onTriggerSearch` to the `useCallback` dependency array
- [ ] 1.2 Verify in the photo feed: tapping an AI label chip on the expanded card fills the search bar with the tag, expands the SearchFab, and reloads the feed with matching photos

## 2. Auto-collapse the expanded card on tag search

- [x] 2.1 In `src/hooks/usePhotoExpansion.js`, expose a `collapseExpanded` callback (sets `expandedPhotoId` to `null`) and return it from the hook
- [x] 2.2 In `src/screens/PhotosList/index.js`, replace the no-op `onBeforeSearch: () => {}` in the `useFeedSearch` call with `onBeforeSearch: () => collapseExpanded()`
- [ ] 2.3 Verify: tapping a tag collapses the expanded card and the feed shows filtered results with the search term visible in the search bar; clearing the search later does not resurrect the photo in an expanded state

## 3. Gate chip interactivity in the Photo card

- [x] 3.1 In `src/components/Photo/index.js`, render AI Label and AI Text chips as `TouchableOpacity` (with `onPress` → `onTriggerSearch`) only when `typeof onTriggerSearch === 'function'`; render them as plain `View` (no `activeOpacity`) otherwise
- [x] 3.2 In `src/components/Photo/index.js`, render moderation label chips as a plain `View` (no `onPress`, no `activeOpacity`) regardless of `onTriggerSearch`
- [ ] 3.3 Verify in the photo feed: AI label and text chips show press feedback and trigger search; moderation chips show no press feedback and do nothing

## 4. Non-feed contexts

- [x] 4.1 In `src/screens/PhotosDetailsShared/index.js`, remove the `onTriggerSearch={emitPhotoSearch}` prop from `<Photo>` (and the now-unused `emitPhotoSearch` import if nothing else uses it)
- [ ] 4.2 Verify: on the shared photo detail screen, wave detail, and friend detail, all AI chips render non-interactive with no press feedback; tapping them does not alter the feed state

## 5. Validation

- [x] 5.1 Run lint on all touched files and fix findings
- [ ] 5.2 Manual pass across all four contexts (feed, shared detail, wave detail, friend detail) on both light and dark themes, confirming chip interactivity matches `specs/tag-click-search/spec.md` and the `ai-content-recognition` delta
