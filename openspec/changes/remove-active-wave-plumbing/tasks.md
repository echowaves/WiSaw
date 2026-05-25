## 1. Fix GraphQL crash

- [x] 1.1 Remove `isActive` field from `listWaves` query in `src/screens/Waves/reducer.js`

## 2. Remove active wave storage

- [x] 2.1 Delete `src/utils/activeWaveStorage.js`
- [x] 2.2 Remove `activeWaveAtom` from `src/state.js`
- [x] 2.3 Remove active wave hydration from `app/_layout.tsx` (import, `hydrateActiveWaveAtom` call, `activeWaveResult` handling, `setActiveWave`)

## 3. Clean up WavesHub

- [x] 3.1 Remove active wave sync from `loadWaves` refresh path in `src/screens/WavesHub/index.js` (the `isActive` find + `setActiveWave`/`saveActiveWave`/`clearActiveWave` block)
- [x] 3.2 Remove active wave clear from `handleDeleteWave` in `src/screens/WavesHub/index.js`
- [x] 3.3 Remove active wave save from `handleAutoGroup` in `src/screens/WavesHub/index.js`
- [x] 3.4 Remove `activeWave` atom usage (`useAtomValue`, `useSetAtom`) and `activeWaveStorage` imports from `src/screens/WavesHub/index.js`

## 4. Clean up upload service

- [x] 4.1 Remove `checkAndAssignWave` function from `src/screens/PhotosList/upload/photoUploadService.js`
- [x] 4.2 Remove `checkAndAssignWave` call and wave assignment logic from `processCompleteUpload` in `photoUploadService.js` (the `assignedWaveUuid`/`isNewWave` block)
- [x] 4.3 Remove `saveActiveWave` call after upload creates new wave in `processCompleteUpload`
- [x] 4.4 Remove `loadActiveWave` import from `photoUploadService.js`
- [x] 4.5 Remove `addPhotoToWave` mutation call gated on `assignedWaveUuid` from `processCompleteUpload` (photos will be ungrouped and handled by auto-group)

## 5. Clean up isLocationInWave (if unused)

- [x] 5.1 Check if `isLocationInWave` in `src/screens/Waves/reducer.js` is referenced anywhere outside the upload drift check path; if not, remove it

## 6. Verify

- [x] 6.1 Grep for any remaining references to `isActive`, `activeWave`, `ActiveWave`, `activeWaveAtom`, `activeWaveStorage`, `checkAndAssignWave`, `isLocationInWave` across the codebase and remove any stragglers
- [x] 6.2 Verify the app builds without errors
