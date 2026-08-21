## 1. Reducer — expose group helpers
- [x] 1.1 Verify `autoGroupPhotosIntoWaves(uuid, groupingLevel)` mutation still exists in the GraphQL schema and is client-callable (it was only made auto-triggered on upload in 2026-06-26; the mutation itself was not removed).
- [x] 1.2 Add an `autoGroupPhotosIntoWaves` reducer function in `src/screens/Waves/reducer.js` calling the `autoGroupPhotosIntoWaves` mutation.
- [x] 1.3 Re-export `autoGroupPhotosIntoWaves` (and confirm `addPhotoToWave`, `requestUngroupedPhotos`, `getUngroupedPhotosCount`) from `src/screens/WavesHub/reducer.js`.

## 2. WavesHub — reintroduce the ungrouped-photos first section
- [x] 2.1 Add an `ungroupedCount` state initialized to `0`, and a `fetchUngroupedCount` function that calls `getUngroupedPhotosCount({ uuid })` and writes the result.
- [x] 2.2 Call `fetchUngroupedCount` on mount and on focus (alongside the existing refresh); call it on photo upload complete and on auto-group complete.
- [x] 2.3 Render `UngroupedPhotosCard` as the `ListHeaderComponent` of the waves FlatList when `ungroupedCount > 0`, and omit it otherwise.
- [x] 2.4 On `handleDeleteWave`, after deleting the wave, call `fetchUngroupedCount` so the deleted wave's photos reappear as ungrouped and the card becomes visible.
- [x] 2.5 After auto-group or manual-group completes, call `fetchUngroupedCount` so the card hides when the pool is empty.
- [x] 2.6 Pass `ungroupedCount`, `uuid`, and `theme` props to `UngroupedPhotosCard`.

## 3. UngroupedPhotosCard — selection mode + grouping actions
- [x] 3.1 Add a `useState` selection set and a `selectionMode` boolean to `UngroupedPhotosCard`.
- [x] 3.2 Add a "Select photos" control entering selection mode; add a toolbar with "Select All", the selected count, and "Cancel".
- [x] 3.3 Wire `WavePhotoStrip` selection props so each thumbnail shows a checkbox overlay and toggling a photo adds/removes it from the selection set.
- [x] 3.4 Add an action bar with three actions: "Auto-Group everything", "Create a wave", "Add to an existing wave".
- [x] 3.5 "Auto-Group everything" is always enabled; confirm it shows a confirmation dialog, then calls `autoGroupPhotosIntoWaves`, then triggers a count refresh.
- [x] 3.6 "Create a wave" and "Add to an existing wave" are disabled while the selection set is empty and enabled once ≥1 photo is selected.

## 4. WavePhotoStrip — selection props
- [x] 4.1 Add optional `selectionMode`, `selected` (per photo), and `onPhotoToggle(photoId)` props to `WavePhotoStrip`, defaulting to disabled so existing callers (`WaveCard`) are unaffected.
- [x] 4.2 Render a checkbox overlay when `selectionMode` is true and route taps through `onPhotoToggle`.

## 5. Manual grouping action
- [x] 5.1 "Create a wave" / "Add to an existing wave" open the existing `WaveSelectorModal` (reuse, no rebuild).
- [x] 5.2 After a wave is chosen (new or existing), call `addPhotoToWave` once per selected photo ID.
- [x] 5.3 After manual grouping completes, trigger `fetchUngroupedCount` so the card hides when the pool is empty.

## 6. Verify
- [x] 6.1 With 0 ungrouped photos, no UngroupedPhotosCard renders and the waves list is unchanged.
- [x] 6.2 With > 0 ungrouped photos, the dashed/unaccented UngroupedPhotosCard appears above all wave cards.
- [x] 6.3 Deleting a wave causes the ungrouped count to rise and the card to appear.
- [x] 6.4 "Auto-Group everything" groups all ungrouped photos; the card hides afterward.
- [x] 6.5 Selecting individual photos enables only "Create a wave" and "Add to an existing wave"; selecting 0 photos disables both.
- [x] 6.6 Manually grouping selected photos moves only those photos into the chosen wave and drops them from the ungrouped pool.
