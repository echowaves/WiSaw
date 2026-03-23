## 1. State & Storage

- [x] 1.1 Add `waveSortBy` and `waveSortDirection` atoms to `src/state.js`
- [x] 1.2 Add `saveWaveSortPreferences` and `loadWaveSortPreferences` functions to `src/utils/waveStorage.js` with 3-second timeout protection

## 2. Startup Hydration

- [x] 2.1 Import `loadWaveSortPreferences` in `app/_layout.tsx` and add to the `Promise.allSettled` hydration block
- [x] 2.2 Set `waveSortBy` and `waveSortDirection` atoms from resolved storage values (default to `updatedAt`/`desc` on failure)

## 3. Waves Screen Consumer

- [x] 3.1 In `app/(drawer)/waves/index.tsx`, replace `useState` for `sortBy`/`sortDirection` with `useAtom(STATE.waveSortBy)` / `useAtom(STATE.waveSortDirection)`
- [x] 3.2 Call `saveWaveSortPreferences` in the sort menu `onPress` handler after updating atoms
- [x] 3.3 Remove `sortBy`/`sortDirection` props passed to `WavesHub`

## 4. WavesHub Effect Consolidation

- [x] 4.1 In `src/screens/WavesHub/index.js`, replace `sortBy`/`sortDirection` props with `useAtom` reads from global atoms
- [x] 4.2 Remove the `useEffect` on `[sortBy, sortDirection]` that triggers a data refetch
- [x] 4.3 Update `useFocusEffect` dependency array to `[loadWaves]` (which captures `uuid`, `sortBy`, `sortDirection` via closure)

## 5. Verification

- [x] 5.1 Verify app starts without errors and Waves screen loads with default sort on fresh install
- [x] 5.2 Verify changing sort order persists across app restart
- [x] 5.3 Verify navigating away from Waves and returning retains the correct sort order
