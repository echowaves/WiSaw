## 1. Add getWave query to waves reducer

- [x] 1.1 Add `getWave` export to `src/screens/Waves/reducer.js` — GraphQL query for `getWave(waveUuid, uuid)` returning full Wave fields, using `fetchPolicy: 'network-only'`

## 2. Update WaveSettings to use getWave

- [x] 2.1 Import `getWave` instead of `updateWave` for loading in `src/screens/WaveSettings/index.js`
- [x] 2.2 Replace `updateWave({ waveUuid, uuid, name: waveName })` in `loadSettings` with `getWave({ waveUuid, uuid })`
- [x] 2.3 Verify WaveSettings renders correctly for a frozen wave (no error on load)
