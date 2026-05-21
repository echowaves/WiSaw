## 1. Fix Wave Count Tracking

- [x] 1.1 In `src/screens/WavesHub/index.js` `handleAutoGroup`, replace `let totalWavesCreated = 0` with a `new Set()` to track unique `waveUuid` values
- [x] 1.2 In the loop body, replace `totalWavesCreated += 1` with `waveUuidSet.add(result.waveUuid)` when `result.waveUuid` is non-null
- [x] 1.3 Update all references to `totalWavesCreated` to use `waveUuidSet.size` (progress state, toast text, wavesCount state update)

## 2. Add photosRemaining to Progress Display

- [x] 2.1 Extend `setAutoGroupProgress` calls to include `photosRemaining` from the API response
- [x] 2.2 Update the progress overlay text in the auto-group progress UI to show remaining count (e.g., "N photos grouped into M waves — R remaining") when `photosRemaining > 0`

## 3. Fix Ungrouped Count on Completion

- [x] 3.1 Replace `setUngroupedPhotosCount(0)` with `setUngroupedPhotosCount(result.photosRemaining)` using the final API response value
