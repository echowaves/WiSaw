## 1. Switch write-only atom consumers to useSetAtom

- [x] 1.1 In `src/screens/WavesHub/index.js`, replace `useAtom` with `useSetAtom` for `wavesCount` and `ungroupedPhotosCount` (both are write-only here)
- [x] 1.2 In `app/(drawer)/waves/index.tsx`, replace `useAtom` with `useSetAtom` for `wavesCount` (write-only); keep `useAtom` for `ungroupedPhotosCount` since it is read for badge display
- [x] 1.3 In `src/screens/PhotosList/index.js`, replace `useAtom` with `useSetAtom` for `ungroupedPhotosCount` (write-only)
- [x] 1.4 In `src/hooks/usePhotoActions.js`, replace `useAtom` with `useSetAtom` for `ungroupedPhotosCount` (write-only)

## 2. Dismiss keyboard on PhotosList focus loss

- [x] 2.1 In `src/screens/PhotosList/index.js`, add `Keyboard.dismiss()` in the `useFocusEffect` cleanup to prevent keyboard-animation conflicts with destination screens

## 3. Verify

- [x] 3.1 Run the app and confirm the waves screen no longer freezes when navigating from the search segment with keyboard active
