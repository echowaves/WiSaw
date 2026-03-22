## 1. WavesHub — emit autoGroupDone after wave deletion

- [x] 1.1 In `src/screens/WavesHub/index.js`, import `emitAutoGroupDone` from `src/events/autoGroupBus` and call it after `deleteWave` succeeds inside `handleDeleteWave`.

## 2. WaveDetail — emit autoGroupDone after wave deletion

- [x] 2.1 In `src/screens/WaveDetail/index.js`, import `emitAutoGroupDone` from `src/events/autoGroupBus` and call it after `deleteWave` succeeds inside `handleDeleteWave`, before `router.back()`.
