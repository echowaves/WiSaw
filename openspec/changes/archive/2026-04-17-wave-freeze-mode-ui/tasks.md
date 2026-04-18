## 1. GraphQL Layer

- [x] 1.1 Add `freezeMode` field to all Wave query/mutation response field sets in `src/screens/Waves/reducer.js`
- [x] 1.2 Add `freezeMode` variable to `updateWave` mutation definition in `src/screens/Waves/reducer.js`
- [x] 1.3 Add `freezeMode` to Wave fields in `src/screens/WavesHub/reducer.js` if it uses a separate fragment

## 2. WaveSettings State and Loading

- [x] 2.1 Add `freezeMode` local state (default `"AUTO"`) in `src/screens/WaveSettings/index.js`
- [x] 2.2 Populate `freezeMode` from `getWave` response in `loadSettings`, defaulting to `"AUTO"` if absent
- [x] 2.3 Replace `isFrozen`-based disable logic with `isDateFrozen` computed from `splashDate`/`freezeDate` (`now < splashDate || now > freezeDate`)

## 3. Freeze Mode UI Control

- [x] 3.1 Add tri-state freeze mode selector (Auto / Frozen / Unlocked) to WaveSettings below the freeze date picker
- [x] 3.2 Style selector as three-button segmented control matching existing theme switcher pattern
- [x] 3.3 On button tap, call `updateWave` with the selected `freezeMode` value and update local state

## 4. Verification

- [x] 4.1 Verify freeze mode persists across screen reload (load → set FROZEN → close → reopen → shows FROZEN)
- [x] 4.2 Verify controls disable based on date-frozen, not effective frozen (FROZEN mode + active dates → controls enabled)
- [x] 4.3 Verify UNFROZEN mode + expired dates → controls disabled, freeze selector still enabled
