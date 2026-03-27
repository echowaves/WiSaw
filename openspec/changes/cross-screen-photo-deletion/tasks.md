## 1. Event Bus

- [x] 1.1 Create `src/events/photoDeletionBus.js` with `emitPhotoDeletion({ photoId })` and `subscribeToPhotoDeletion(listener)` following the Set-based pattern from `uploadBus.js`

## 2. Emit Deletion Event

- [x] 2.1 Import `emitPhotoDeletion` in `src/hooks/usePhotoActions.js` and call it after successful `deletePhoto` mutation, before the `onDeleted` callback

## 3. Screen Subscriptions

- [x] 3.1 Subscribe PhotosList (`src/screens/PhotosList/index.js`) to `photoDeletionBus` via `useEffect`, removing the matching photo from local state on event
- [x] 3.2 Subscribe WaveDetail (`src/screens/WaveDetail/index.js`) to `photoDeletionBus` via `useEffect`, removing the matching photo from local state on event

## 4. Verification

- [x] 4.1 Verify no leftover imports or unused references across modified files
- [x] 4.2 Run Codacy analysis on all modified files
