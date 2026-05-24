## 1. Update GraphQL mutation selection set

- [x] 1.1 In `src/screens/Waves/reducer.js`, add `wavesCreated` to the `autoGroupPhotosIntoWaves` mutation selection set (alongside existing fields: waveUuid, name, photosGrouped, photosRemaining, hasMore, isNewWave)

## 2. Replace Set-based wave counting with accumulated counter

- [x] 2.1 In `src/screens/WavesHub/index.js`, replace the `waveUuidSet` Set and its usage in `handleAutoGroup` with a simple integer counter (`totalWavesCreated`) that accumulates `result.wavesCreated ?? 0` from each batch response
- [x] 2.2 Update the progress overlay text to use the accumulated counter (the existing `autoGroupProgress.wavesCreated` state is already wired correctly — just ensure it receives the accumulated value)

## 3. Verify correctness

- [x] 3.1 Confirm that all toast messages, wave count updates (`setWavesCount`), and progress displays now use the accumulated counter instead of Set.size
- [x] 3.2 Ensure backward compatibility: use `result.wavesCreated ?? 0` to handle cases where the backend field might be absent during rollout
