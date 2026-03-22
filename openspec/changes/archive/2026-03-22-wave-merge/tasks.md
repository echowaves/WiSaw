## 1. GraphQL Mutation

- [x] 1.1 Add `mergeWaves` GraphQL mutation to `src/screens/Waves/reducer.js`
- [x] 1.2 Re-export `mergeWaves` from `src/screens/WavesHub/reducer.js`
- [x] 1.3 Re-export `mergeWaves` from `src/screens/WaveDetail/reducer.js`

## 2. MergeWaveModal Component

- [x] 2.1 Create `src/components/MergeWaveModal/index.js` — purpose-built modal with wave list, search/filter, exclude source wave, and selection callback
- [x] 2.2 Add loading state and empty state ("No waves found") to the modal

## 3. WaveCard Context Hint

- [x] 3.1 Add tappable ⋮ icon to the WaveCard info row (right-aligned) that triggers `onLongPress`
- [x] 3.2 Add one-time tooltip ("Hold or tap ⋮ for options") to WavesHub, persisted via SecureStore key `waveContextMenuTooltipShown`

## 4. WavesHub Merge Integration

- [x] 4.1 Add "Merge Into Another Wave..." option to `showWaveContextMenu` in WavesHub (iOS ActionSheet and Android Alert), owner-only, before Delete
- [x] 4.2 Add merge state and `handleMergeWave` handler to WavesHub — opens MergeWaveModal, shows confirmation alert, calls `mergeWaves`, updates list (remove source, update target photosCount), shows toast

## 5. WaveDetail Merge Integration

- [x] 5.1 Add "Merge Into Another Wave..." option to `showHeaderMenu` in WaveDetail (iOS ActionSheet and Android Alert), owner-only, before Delete
- [x] 5.2 Add merge state and handler to WaveDetail — opens MergeWaveModal, shows confirmation alert, calls `mergeWaves`, navigates back via `router.back()`, shows toast
