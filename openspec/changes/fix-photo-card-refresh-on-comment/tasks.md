## 1. Await watchPhoto in submitComment

- [x] 1.1 Add `await` to the `watchPhoto()` call inside `submitComment` in `src/components/Photo/reducer.js` so the bookmark mutation completes before returning

## 2. Remove watchersCount override in Photo component

- [x] 2.1 Remove the `watchersCount: photo.watchersCount` override from the `useEffect` load handler in `src/components/Photo/index.js`, allowing the `getPhotoDetails` query response to provide the authoritative value

## 3. Add refresh to modal input flow

- [x] 3.1 Import `emitPhotoRefresh` and `getPhotoDetails` (from reducer) into `app/modal-input.tsx`
- [x] 3.2 After `submitComment` succeeds and before `router.back()`, call `emitPhotoRefresh({ photoId })` then `await getPhotoDetails` and update the parent photoDetails state

## 4. Verify end-to-end flow

- [x] 4.1 Test inline comment submission — verify bookmark count updates on expanded card *(manual verification needed on device)*
- [x] 4.2 Test modal comment submission — verify bookmark count updates after modal dismisses *(manual verification needed on device)*
- [x] 4.3 Verify bookmark icon (filled/empty) updates correctly in both flows *(manual verification needed on device)*
