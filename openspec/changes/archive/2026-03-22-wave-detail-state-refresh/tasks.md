## 1. WaveDetail Header Title Sync

- [x] 1.1 In `src/screens/WaveDetail/index.js`, add `router.setParams({ waveName: editName })` to `handleSaveEdit` after the `updateWave` mutation succeeds, immediately before or after `setWaveName(editName)`

## 2. WaveDetail Focus Refresh

- [x] 2.1 In `src/screens/WaveDetail/index.js`, import `useFocusEffect` from `@react-navigation/native` (or `expo-router`) and add a focus effect that resets `pageNumber` to 0, generates a new `batch` UUID, clears `expandedPhotoIds`, resets `noMoreData`, and calls `loadPhotos` with the fresh page/batch

## 3. WavesHub Focus Refresh

- [x] 3.1 In `src/screens/WavesHub/index.js`, import `useFocusEffect` and add a focus effect that resets pagination to page 0 with a new batch UUID and calls `loadWaves` in refresh mode

## 4. Ungrouped Count Focus Refresh

- [x] 4.1 In `app/(drawer)/waves/index.tsx`, import `useFocusEffect` and add a focus effect that calls `fetchUngroupedCount()` every time the screen gains focus
