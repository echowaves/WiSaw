## 1. Await watchPhoto in submitComment

- [x] 1.1 Add `await` to the `watchPhoto()` call inside `submitComment` in `src/components/Photo/reducer.js` so the bookmark mutation completes before returning

## 2. Remove watchersCount override in Photo component

- [x] 2.1 Remove the `watchersCount: photo.watchersCount` override from the `useEffect` load handler in `src/components/Photo/index.js`. Note: `watchersCount` is not returned by `getPhotoDetails` GraphQL query (not in `PhotoDetails` backend type), so this override was unnecessary.

## 3. Add refresh to modal input flow

- [x] 3.1 Import `emitPhotoRefresh` and `getPhotoDetails` (from reducer) into `app/modal-input.tsx`
- [x] 3.2 After `submitComment` succeeds and before `router.back()`, call `await getPhotoDetails` and update the parent photoDetails state

## 4. Verify end-to-end flow

- [x] 4.1 Test inline comment submission — verify bookmark icon (filled/empty) updates correctly *(manual verification needed on device)*
- [x] 4.2 Test modal comment submission — verify bookmark icon updates correctly after modal dismisses *(manual verification needed on device)*
- [x] 4.3 Verify bookmark button state (`isPhotoWatched`) updates in both flows *(manual verification needed on device)*

## Known Limitation

The `watchersCount` field is not available in the `PhotoDetails` GraphQL type. Bookmark count display will remain at the last known value from the original photo object. To display accurate bookmark count after comment submission, the backend must add `watchersCount` to the `PhotoDetails` type.
