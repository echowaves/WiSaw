## 1. GraphQL Operations (reducer.js)

- [ ] 1.1 Rename `startDate` → `splashDate`, `endDate` → `freezeDate` in `listWaves` query response fields; remove `frozen` and `isActive` fields
- [ ] 1.2 Rename `startDate` → `splashDate`, `endDate` → `freezeDate` in `createWave` mutation response fields; remove `frozen` and `isActive` fields
- [ ] 1.3 Update `updateWave` function signature: remove `frozen` param, rename `startDate` → `splashDate`, `endDate` → `freezeDate`
- [ ] 1.4 Update `updateWave` variable guards: rename conditional assignments to use `splashDate`/`freezeDate`
- [ ] 1.5 Update `updateWave` mutation string: remove `$frozen: Boolean`, rename `$startDate` → `$splashDate`, `$endDate` → `$freezeDate` in both the declaration and invocation lines
- [ ] 1.6 Update `updateWave` response fields: same renames and removals as listWaves

## 2. WaveSettings UI

- [ ] 2.1 Rename state variables: `startDate` → `splashDate`, `endDate` → `freezeDate`; rename date picker visibility state accordingly
- [ ] 2.2 Update `loadSettings`: read `wave.isFrozen` (not `wave.frozen`), `wave.splashDate`, `wave.freezeDate`
- [ ] 2.3 Remove `handleToggleFrozen` function and the freeze toggle UI section entirely
- [ ] 2.4 Rename `handleStartDateChange` → `handleSplashDateChange`, update to call `updateWave` with `splashDate`
- [ ] 2.5 Rename `handleEndDateChange` → `handleFreezeDateChange`, update to call `updateWave` with `freezeDate`
- [ ] 2.6 Rename `clearStartDate` → `clearSplashDate`, `clearEndDate` → `clearFreezeDate` and update their `updateWave` calls
- [ ] 2.7 Update date section labels: "Start Date" → "Splash Date" with description "Wave goes live on this date"; "End Date" → "Freeze Date" with description "Wave auto-freezes after this date"
- [ ] 2.8 Update `freezeDate` picker to remain enabled when `isFrozen` is true (remove `isFrozen` from its disabled condition)
- [ ] 2.9 Update frozen banner text to reference freeze date instead of freeze toggle

## 3. WaveCard Pending Badge

- [ ] 3.1 Replace `wave.isActive === false` check with `wave.splashDate && new Date(wave.splashDate) > new Date()` for the "Pending" badge

## 4. Verification

- [ ] 4.1 Verify WavesHub (`src/screens/WavesHub/index.js`) has no remaining `isActive`/`startDate`/`endDate`/`frozen` references
- [ ] 4.2 Verify WaveDetail (`src/screens/WaveDetail/index.js`) has no remaining stale field references
