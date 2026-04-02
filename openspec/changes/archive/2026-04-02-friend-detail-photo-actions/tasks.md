## 1. Wire QuickActionsModal in FriendDetail

- [x] 1.1 Import `QuickActionsModalWrapper` from `../../components/QuickActionsModal` in `src/screens/FriendDetail/index.js`
- [x] 1.2 Add a `useRef` for `quickActionsRef` and update `handlePhotoLongPress` to call `quickActionsRef.current?.open(photo)`
- [x] 1.3 Render `<QuickActionsModalWrapper ref={quickActionsRef} setPhotosList={setPhotos} />` in the JSX tree

## 2. Verify

- [ ] 2.1 Long-press a photo in the friend detail feed and confirm the quick-actions modal opens with preview and action buttons
- [ ] 2.2 Tap the ⋮ pill on a photo thumbnail and confirm the same modal opens
- [ ] 2.3 Delete a photo via the modal and confirm it is removed from the feed list without a full re-fetch
