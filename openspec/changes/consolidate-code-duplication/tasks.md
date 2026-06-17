## 1. Create notification utilities

- [x] 1.1 Create `src/utils/showToast.js` with standardized defaults (topOffset: 60, visibilityTime: 2000/3000, position: 'top')
- [x] 1.2 Create `src/utils/showConfirmAlert.ts` with confirmation dialog pattern (Cancel + destructive button)
- [x] 1.3 Replace all 50+ `Toast.show()` calls with `showToast()` in WaveDetail, FriendDetail, WavesHub, BookmarksList, FriendsList, PhotoSelectionMode, Feedback, ModalInputText, useCameraCapture, useLocationProvider, consts
- [x] 1.4 Replace confirmation `Alert.alert()` calls with `showConfirmAlert()` in WaveDetail, WavesHub, FriendDetail, usePhotoActions, WaveModeration, WaveMembers, PendingPhotosBanner, Secret
- [x] 1.5 Verify no direct `Toast.show()` calls remain (all replaced); Alert.alert() remaining are error/info messages (not confirmations)

## 2. Create useDebouncedSearch hook

- [x] 2.1 Create `src/hooks/useDebouncedSearch.js` with configurable delay (default 300ms)
- [x] 2.2 Replace debounce useEffect in WavesHub (line ~252)
- [x] 2.3 Replace debounce useEffect in FriendsList (line ~99)
- [x] 2.4 Replace debounce useEffect in MergeWaveModal (line ~75)
- [x] 2.5 Replace debounce useEffect in WaveSelectorModal (line ~94)

## 3. Consolidate constants in src/consts.js

- [x] 3.1 Add `WAVE_ROLES` to src/consts.js
- [x] 3.2 Add `BOOKMARK_LAYOUT_CONFIG` to src/consts.js
- [x] 3.3 Add `GEO_FEED_LAYOUT_CONFIG` to src/consts.js
- [x] 3.4 Update WaveDetail to import WAVE_ROLES (remove local ROLE_CONFIG)
- [x] 3.5 Update WaveMembers to import WAVE_ROLES and extend with icons
- [x] 3.6 Update WaveCard to import WAVE_ROLES (remove local ROLE_CONFIG)
- [x] 3.7 Update WaveDetail to use BOOKMARK_LAYOUT_CONFIG (remove local segmentConfig useMemo)
- [x] 3.8 Update FriendDetail to use BOOKMARK_LAYOUT_CONFIG (remove local segmentConfig useMemo)
- [x] 3.9 Update BookmarksList to use BOOKMARK_LAYOUT_CONFIG (remove local segmentConfig useMemo)
- [x] 3.10 Update PhotosList to use GEO_FEED_LAYOUT_CONFIG (remove local segmentConfig useMemo)

## 4. Extract QuickActionsModalWrapper

- [x] 4.1 Create `src/components/QuickActionsModalWrapper/index.js` with React.memo, forwardRef, useImperativeHandle pattern
- [x] 4.2 Update WaveDetail to use QuickActionsModalWrapper (pass onPhotoDeleted + onPhotoRemovedFromWave)
- [x] 4.3 Update FriendDetail to use QuickActionsModalWrapper (pass onPhotoDeleted)
- [x] 4.4 Update PhotosList to use QuickActionsModalWrapper in both render branches (lines 525, 752)
- [x] 4.5 Delete `src/components/QuickActionsModalWrapper/` zombie directory

## 5. Extract EditWaveModal

- [x] 5.1 Create `src/components/EditWaveModal/index.js` with configurable title, initialData, onSave, onClose, saving state
- [x] 5.2 Update WaveDetail to use EditWaveModal (replace inline edit modal JSX at line ~656)
- [x] 5.3 Update WavesHub to use EditWaveModal for edit (replace inline edit modal JSX at line ~655+)
- [x] 5.4 Update WavesHub to use EditWaveModal for create (replace inline create modal JSX)

## 6. Move PhotosList internals to shared directories

- [x] 6.1 Move `src/screens/PhotosList/components/PhotosListMasonry` → `src/components/PhotosListMasonry`
- [x] 6.2 Move `src/screens/PhotosList/components/PhotosListFooter` → `src/components/PhotosListFooter`
- [x] 6.3 Move `src/screens/PhotosList/components/PhotosListHeader` → `src/components/PhotosListHeader`
- [x] 6.4 Move `src/screens/PhotosList/components/PhotosListEmptyState` → `src/components/PhotosListEmptyState`
- [x] 6.5 Move `src/screens/PhotosList/hooks/useFeedLoader` → `src/hooks/useFeedLoader`
- [x] 6.6 Move `src/screens/PhotosList/hooks/usePhotoExpansion` → `src/hooks/usePhotoExpansion`
- [x] 6.7 Move `src/screens/PhotosList/hooks/useFeedSearch` → `src/hooks/useFeedSearch`
- [x] 6.8 Move `src/screens/PhotosList/hooks/useCameraCapture` → `src/hooks/useCameraCapture`
- [x] 6.9 Move `src/screens/PhotosList/hooks/usePendingAnimation` → `src/hooks/usePendingAnimation`
- [x] 6.10 Update all import paths in PhotosList/index.js
- [x] 6.11 Update all import paths in BookmarksList/index.js (uses useFeedLoader, PhotosListMasonry, etc.)
- [x] 6.12 Update all import paths in WaveDetail/index.js (uses PhotosListMasonry, etc.)
- [x] 6.13 Update all import paths in FriendDetail/index.js (uses PhotosListMasonry, etc.)

## 7. Migrate WaveDetail to useFeedLoader

- [x] 7.1 Study existing useFeedLoader implementation to understand API surface
- [x] 7.2 Replace WaveDetail's manual `loadPhotos()` function with useFeedLoader call
- [x] 7.3 Pass `fetchWavePhotos` as fetchFn and `createFrozenPhoto({...item, waveIsFrozen, waveViewerRole})` as transformFn
- [x] 7.4 Remove WaveDetail's `handleRefresh()` and `handleLoadMore()` implementations
- [x] 7.5 Remove WaveDetail's `pageNumber`, `batch`, `noMoreData` state declarations (provided by hook)
- [x] 7.6 Remove WaveDetail's `stopLoading` ref if it was only used for pagination (verify no other usages)
- [x] 7.7 Update WaveDetail's useEffect for initial data loading
- [x] 7.8 Verify WaveDetail's photo list rendering works correctly
- [x] 7.9 Test pagination (load more) in WaveDetail
- [x] 7.10 Test refresh in WaveDetail

## 8. Migrate FriendDetail to useFeedLoader

- [x] 8.1 Replace FriendDetail's manual `loadPhotos()` function with useFeedLoader call
- [x] 8.2 Pass `fetchFriendPhotos` as fetchFn and `createFrozenPhoto(item)` as transformFn (or use default)
- [x] 8.3 Remove FriendDetail's `handleRefresh()` and `handleLoadMore()` implementations
- [x] 8.4 Remove FriendDetail's `pageNumber`, `batch`, `noMoreData` state declarations
- [x] 8.5 Update FriendDetail's useEffect for initial data loading
- [x] 8.6 Verify FriendDetail's photo list rendering works correctly
- [x] 8.7 Test pagination (load more) in FriendDetail
- [x] 8.8 Test refresh in FriendDetail

## 9. Update QuickActionsModal usage in BookmarksList

- [x] 9.1 Update BookmarksList to use QuickActionsModalWrapper instead of rendering QuickActionsModal directly
- [x] 9.2 Remove BookmarksList's inline longPressPhoto state management, use ref-based open() API
- [x] 9.3 QuickActionsModalWrapper adopted successfully

## 10. Final verification

- [x] 10.1 Run ESLint on all changed files
- [ ] 10.2 Verify all screens still render correctly (PhotosList, BookmarksList, WaveDetail, FriendDetail, WavesHub)
- [ ] 10.3 Verify all notification patterns display correctly
- [ ] 10.4 Verify all modal patterns work correctly (edit wave, create wave, quick actions)
- [ ] 10.5 Verify pagination works in all 4 photo-listing screens
- [ ] 10.6 Verify search debounce works in WavesHub, FriendsList, MergeWaveModal, WaveSelectorModal
