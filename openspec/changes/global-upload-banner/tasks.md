## 1. Add bannerHeightAtom to state module

- [x] 1.1 Add `bannerHeightAtom` (Jotai writable atom, default 0) to `src/state.js`

## 2. Create GlobalUploadBanner component

- [x] 2.1 Create `src/components/GlobalUploadBanner/index.js` — consumes `UploadContext` and `STATE.netAvailable` directly via `useContext` and `useAtomValue`
- [x] 2.2 Implement fixed absolute positioning anchored to `useSafeAreaInsets().top`, matching existing PendingPhotosBanner visual design (rounded card, icon, text, LinearProgress bar)
- [x] 2.3 Add `onLayout` to measure banner height and write to `bannerHeightAtom`; reset atom to 0 when hidden (no pending photos)
- [x] 2.4 Incorporate animation logic from `usePendingAnimation` (spring entrance/timing exit + icon pulse during upload) directly into the component
- [x] 2.5 Handle long-press clear queue with toast offset computed as `safeAreaInsets.top + bannerHeight + 10`

## 3. Mount GlobalUploadBanner in drawer layout

- [x] 3.1 Import and render `GlobalUploadBanner` inside `UploadProvider` alongside the Drawer in `app/(drawer)/_layout.tsx`

## 4. Add bannerHeightAtom padding to existing screens

- [x] 4.1 PhotosList: import `bannerHeightAtom`, apply as paddingTop above AppHeader, remove `PendingPhotosBanner` import and all 6 inline renders, remove `usePendingAnimation` import and usage
- [x] 4.2 WaveDetail: apply `bannerHeightAtom` padding, remove `PendingPhotosBanner` render and `usePendingAnimation`
- [x] 4.3 WavesHub: apply `bannerHeightAtom` padding, remove `PendingPhotosBanner` render and `usePendingAnimation`

## 5. Add bannerHeightAtom padding to previously missing screens

- [x] 5.1 BookmarksList: import `bannerHeightAtom`, apply as paddingTop above AppHeader in all render paths
- [x] 5.2 FriendsList: import `bannerHeightAtom`, apply as paddingTop above AppHeader in all render paths

## 6. Delete dead code

- [x] 6.1 Delete `src/screens/PhotosList/components/PendingPhotosBanner.js`
- [x] 6.2 Delete `src/hooks/usePendingAnimation.js`

## 7. Verify and clean up

- [x] 7.1 Search for any remaining imports of `PendingPhotosBanner` or `usePendingAnimation` across the codebase and remove them
- [x] 7.2 Verify banner appears correctly on all drawer screens (PhotosList, WaveDetail, WavesHub, BookmarksList, FriendsList) with uploads pending
- [x] 7.3 Verify banner hides and padding collapses to 0 when queue is empty
