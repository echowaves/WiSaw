## 1. Switch PhotosList to local state

- [x] 1.1 In `src/screens/PhotosList/index.js`, replace `useAtom(STATE.photosList)` with `useState([])`. Update all references from `photosList`/`setPhotosList` to use the local state. Ensure the `QuickActionsModalWrapper` receives the local setter.

## 2. Remove photosList atom from state.js

- [x] 2.1 In `src/state.js`, remove the `photosList` export, `photosListAtom`, `protectPhotos` function, the `createFrozenPhoto` import, and the dev-mode console.log about the enhanced atom.

## 3. Remove unused STATE.photosList import

- [x] 3.1 In `src/screens/PhotosList/index.js`, remove the `STATE.photosList` import if no other `STATE.*` references remain, or verify remaining `STATE.*` imports are still needed.
