## 1. Create SearchFab component

- [x] 1.1 Create `src/components/SearchFab/index.js` with Reanimated-driven expand/collapse animation: FAB icon (magnifying glass) anchored left, TextInput slides left-to-right, clear button (✕), spring animation via `useSharedValue` and `withSpring`
- [x] 1.2 Accept props: `searchTerm`, `setSearchTerm`, `onSubmitSearch`, `onClearSearch`, `isExpanded`, `setIsExpanded`, `theme`, `footerHeight`
- [x] 1.3 When collapsed, render as a circular 56×56 FAB with magnifying glass icon; when expanded, render full-width bar with TextInput, ✕ clear button, and FAB icon as submit button

## 2. Remove search segment from PhotosList

- [x] 2.1 In `PhotosListHeader.js`, remove 'Search' from `SEGMENT_TITLES` and the search icon from `SEGMENT_ICONS` — reduce to `['Global', 'Starred']`
- [x] 2.2 In `PhotosList/index.js`, remove `case 2` from `segmentConfig` switch
- [x] 2.3 In `PhotosList/index.js`, remove all `activeSegment === 2` conditionals from the render branches (search bar rendering, empty state 'Ready to Search')
- [x] 2.4 In `PhotosListEmptyState.js`, remove the `case 2` search empty state

## 3. Integrate search state with FAB in PhotosList

- [x] 3.1 Add `isSearchActive` state (`useState(false)`) and `isSearchExpanded` state to PhotosList
- [x] 3.2 Change the search guard in `load()` from `if (effectiveSegment === 2)` to `if (isSearchActive)` — search term applies to whichever segment is active
- [x] 3.3 Remove `index === 2` special case from `updateIndex` — no more search term pass-through for segment 2
- [x] 3.4 Update `submitSearch` to work with `isSearchActive` instead of segment 2 check
- [x] 3.5 Render `SearchFab` in the PhotosList outer View (absolutely positioned above footer), passing search state props and theme
- [x] 3.6 Implement `onClearSearch` callback: set `isSearchActive` to false, clear `searchTerm`, collapse FAB, call `reload()` to restore unfiltered segment feed

## 4. Update external search entry points

- [x] 4.1 Update `searchFromUrl` handler: set `isSearchActive = true`, `setSearchTerm(term)`, `setIsSearchExpanded(true)`, call `reload(activeSegment, term)` — remove `setActiveSegment(2)`
- [x] 4.2 Update `pendingTriggerSearch` handler (photoSearchBus/AI tags): same pattern — set `isSearchActive = true`, expand FAB, call `reload(activeSegment, term)` — remove `setActiveSegment(2)`

## 5. Update empty states for search

- [x] 5.1 Add search-active no-results empty state: when `isSearchActive && stopLoading && photosList.length === 0`, show EmptyStateCard with "No results for '{term}'" and "Clear Search" action
- [x] 5.2 Remove the old segment-2 empty state rendering in the final return block (`activeSegment === 2` with 'Ready to Search' card)

## 6. Cleanup

- [x] 6.1 Delete `src/screens/PhotosList/components/PhotosListSearchBar.js`
- [x] 6.2 Remove all imports of `PhotosListSearchBar` from PhotosList and PhotosListEmptyState
- [x] 6.3 Verify no remaining references to segment 2 or `PhotosListSearchBar` in the codebase

## 7. Verify

- [x] 7.1 Test FAB expand/collapse animation on both segments
- [x] 7.2 Test search submission and results display on Global and Starred segments
- [x] 7.3 Test AI tag click triggers FAB expansion and search
- [x] 7.4 Test clear button dismisses search and restores unfiltered feed

## 8. Post-implementation fixes (applied during testing)

- [x] 8.1 Fix FAB icon not visible / not clickable — restructured to two-sibling architecture (bar + FAB as siblings) to avoid `overflow: 'hidden'` clipping
- [x] 8.2 Fix large gap between FAB and keyboard — animate bottom offset from `FOOTER_HEIGHT + 16` to `8px` when keyboard opens
- [x] 8.3 Fix segment layout changing during search — removed `isSearchActive` from `shouldShowComments` in PhotosListMasonry
- [x] 8.4 Move FAB to left side — anchored left, expands L→R
- [x] 8.5 Fix keyboard dismiss on submit — added `Keyboard.dismiss()` to both submit paths
- [x] 8.6 Fix keyboard re-popup after results load — auto-focus only fires on collapsed→expanded transition via `useRef` guard
- [x] 8.7 Revert masonry resize on keyboard open — layout no longer adjusts for keyboard
- [x] 8.8 Simplify search state — `isSearchActive` derived from `searchTerm.length > 0`, removed separate `setIsSearchActive` state
- [x] 8.9 Route search through segment-specific endpoints — `feedByDate`/`feedForWatcher` accept optional `searchTerm`, removed `FEED_FOR_TEXT_SEARCH_QUERY` and `requestSearchedPhotos`
- [x] 8.10 Remove `searchTerm.length < 3` guard — backend handles any term length
- [x] 8.11 Fix stale state in `load()` — added `pageOverride` parameter, `reload()` passes page 0 explicitly, `handleLoadMore` passes new page explicitly, simplified `submitSearch` and `handleClearSearch` to avoid redundant state resets
