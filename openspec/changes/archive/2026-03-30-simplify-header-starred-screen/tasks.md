## 1. Extract Shared Hooks

- [x] 1.1 Create `useFeedLoader` hook in `src/screens/PhotosList/hooks/useFeedLoader.js` — extract photo list state, `load()`, `reload()`, `handleLoadMore()`, pagination (`pageNumber`, `stopLoading`, `consecutiveEmptyResponses`), abort controller, batch tracking, freeze/dedup, `removePhoto`, photo deletion bus subscription, and opt-in upload bus subscription from `PhotosList/index.js`. Parameterize by `fetchFn` and `subscribeToUploads`.
- [x] 1.2 Create `useFeedSearch` hook in `src/screens/PhotosList/hooks/useFeedSearch.js` — extract `searchTerm`, `isSearchExpanded`, `pendingTriggerSearch`, `submitSearch`, `handleClearSearch`, `triggerSearch`, photo search bus subscription, and `searchFromUrl` handling from `PhotosList/index.js`. Accept `onSearch` and `onClear` callbacks.

## 2. Refactor PhotosList to Use Extracted Hooks

- [x] 2.1 Refactor `PhotosList/index.js` to use `useFeedLoader` with `fetchFn: requestGeoPhotos` and `subscribeToUploads: true` — remove all inline feed loading, pagination, abort, freeze/dedup, and event subscription code that is now in the hook.
- [x] 2.2 Refactor `PhotosList/index.js` to use `useFeedSearch` with callbacks to `useFeedLoader.reload()` — remove all inline search state and event handling code that is now in the hook.
- [x] 2.3 Remove all `activeSegment` state, `updateIndex()` function, segment config switching, and segment-dependent conditionals (`activeSegment === 0`/`1` checks) from `PhotosList/index.js`. The screen is now Global-only.
- [x] 2.4 Remove the starred-specific empty state ("No Starred Content Yet" / "Discover Content" button) from `PhotosList/index.js`.

## 3. Simplify PhotosListHeader

- [x] 3.1 Remove segment control from `PhotosListHeader.js` — remove `SEGMENT_TITLES`, `SEGMENT_ICONS`, the segment `TouchableOpacity` buttons, and the `activeSegment`/`updateIndex`/`segmentWidth` props. Header becomes: identity icon (left), empty center, waves icon (right).
- [x] 3.2 Update `PhotosListHeader.js` props and simplify the component signature — remove `activeSegment`, `updateIndex`, `segmentWidth`, and related style definitions.

## 4. Create Starred Screen

- [x] 4.1 Create `src/screens/StarredList/index.js` — new screen component using `useFeedLoader` with `fetchFn: requestWatchedPhotos` and `subscribeToUploads: false`, `useFeedSearch`, `usePhotoExpansion`, starred-specific `segmentConfig` (larger tiles, square aspect ratios), `AppHeader` with title "Starred", `PhotosListMasonry`, `SearchFab`, and starred-specific empty state.
- [x] 4.2 Create `app/(drawer)/starred.tsx` route file pointing to the `StarredList` screen component.

## 5. Update Drawer Navigation

- [x] 5.1 Add Starred `Drawer.Screen` to `app/(drawer)/_layout.tsx` — positioned between Identity and Friends, using AntDesign `star` icon, label "Starred", disabled when offline.

## 6. Clean Up Reducer

- [x] 6.1 Export `requestGeoPhotos` and `requestWatchedPhotos` individually from `src/screens/PhotosList/reducer.js` so they can be imported directly as `fetchFn` parameters. Simplify or remove the `getPhotos()` segment dispatch wrapper if no longer needed.

## 7. Verify and Test

- [x] 7.1 Verify Global feed works: launch app, confirm header has no segments, photos load by location, search works, camera capture works, upload prepends to feed, drift banner appears on location change.
- [x] 7.2 Verify Starred screen works: open drawer, tap Starred, confirm photos load from `feedForWatcher`, search works, no camera button, no upload prepend, empty state shows "No Starred Content Yet" with "Discover Content" navigation.
- [x] 7.3 Verify drawer ordering: Home, Identity, Starred, Friends, Waves, Feedback.
