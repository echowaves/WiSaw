## 1. GraphQL & Reducer Updates

- [x] 1.1 Add `getUngroupedPhotosCount` query function to `src/screens/Waves/reducer.js` — calls `getUngroupedPhotosCount(uuid: String!): Int!`
- [x] 1.2 Replace `photos` with `photosCount` in the `listWaves` query in `src/screens/Waves/reducer.js`
- [x] 1.3 Re-export `getUngroupedPhotosCount` from `src/screens/WavesHub/reducer.js`

## 2. Wave Photo Count Fix

- [x] 2.1 Update `src/components/WaveCard/index.js` to use `wave.photosCount` (with fallback `?? 0`) instead of `wave.photos ? wave.photos.length : 0`

## 3. Auto-Group Header Button

- [x] 3.1 Update `app/(drawer)/waves.tsx` to add auto-group button in AppHeader `rightSlot`: `layer-group` icon with ungrouped count badge, fetch count on mount via `getUngroupedPhotosCount`, tap triggers confirmation → auto-group loop → refresh
- [x] 3.2 Update `app/(drawer)/waves-hub.tsx` to add the same auto-group header button with badge (shared logic with waves.tsx)
- [x] 3.3 After auto-group completes, re-fetch ungrouped count and refresh wave list in WavesHub (emit event or use callback ref)

## 4. Cleanup

- [x] 4.1 Remove any remaining references to `wave.photos.length` for counting purposes in WavesHub/index.js (if any)
- [x] 4.2 Verify `fetchWaveThumbnails` in WavesHub/reducer.js still works correctly without the `photos` field in `listWaves` (thumbnails come from `feedForWatcher`, not `listWaves`)
