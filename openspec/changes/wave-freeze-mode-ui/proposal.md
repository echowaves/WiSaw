## Why

The backend now supports an explicit `freezeMode` tri-state (`AUTO`, `FROZEN`, `UNFROZEN`) on waves, allowing owners to override date-derived freeze behavior. The frontend has no way to set or display this override — owners can only control freeze state indirectly via freeze dates. Adding a freeze mode control to WaveSettings gives owners direct operational control over wave mutability.

## What Changes

- Add a tri-state freeze mode selector to the WaveSettings screen (Auto / Frozen / Unlocked), positioned alongside the existing freeze date picker
- Wire `freezeMode` parameter through the `updateWave` GraphQL mutation in the frontend reducer
- Include `freezeMode` in all Wave query/mutation response field sets so the UI reads current state
- Fix WaveSettings control disable logic: use date-frozen (computed from `splashDate`/`freezeDate`) for disabling non-freeze settings, rather than effective `isFrozen` — this prevents mismatch with the backend which gates on date-frozen state, not effective state

## Capabilities

### New Capabilities

- `wave-freeze-mode-control`: Owner-facing UI control for selecting wave freeze mode (AUTO/FROZEN/UNFROZEN) with visual feedback and persistence via `updateWave` mutation

### Modified Capabilities

- `wave-settings`: Add freeze mode selector section; fix control disable logic to use date-frozen instead of effective frozen
- `wave-graphql-operations`: Add `freezeMode` field to Wave query responses and `updateWave` mutation parameters
- `wave-settings-load`: Load `freezeMode` from wave data and populate UI state

## Impact

- `src/screens/WaveSettings/index.js`: Add freeze mode state, tri-state control UI, update disable logic
- `src/screens/Waves/reducer.js`: Add `freezeMode` to `updateWave` mutation variables and all Wave field fragments
- `src/screens/WavesHub/reducer.js`: Add `freezeMode` to re-exported wave fields if using shared fragment
- `openspec/specs/wave-settings/spec.md`: Update freeze control and disable-logic requirements
- `openspec/specs/wave-graphql-operations/spec.md`: Add `freezeMode` to mutation/query fields
- `openspec/specs/wave-settings-load/spec.md`: Add `freezeMode` to loaded state
