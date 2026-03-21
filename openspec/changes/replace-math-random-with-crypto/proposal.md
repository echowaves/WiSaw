## Why

Codacy/Opengrep flags all `String(Math.random())` calls as weak random number generators. The codebase already uses `expo-crypto` with `Crypto.randomUUID()` for the same batch-ID pattern in `PhotosList/index.js` and `Chat/useMessages.js`. The remaining 13 active `Math.random()` calls across 6 files are stragglers that were not migrated, creating inconsistency and ongoing Codacy findings.

## What Changes

- **Replace all `String(Math.random())` calls** with `Crypto.randomUUID()` from `expo-crypto` in the following files:
  - `src/screens/WaveDetail/index.js` (3 occurrences)
  - `src/screens/WavesHub/index.js` (3 occurrences)
  - `src/screens/Waves/index.js` (3 occurrences)
  - `src/screens/PhotoSelectionMode/index.js` (2 occurrences)
  - `src/screens/WavesHub/reducer.js` (1 occurrence)
  - `src/components/WaveSelectorModal/index.js` (1 occurrence)
- **Add `import * as Crypto from 'expo-crypto'`** to each file that doesn't already have it

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

_(none — this is a pure implementation-detail refactor replacing a weak RNG with a crypto-secure one; no behavior change)_

## Impact

- **Code**: 6 source files updated, each gaining an `expo-crypto` import and replacing `String(Math.random())` → `Crypto.randomUUID()`
- **Dependencies**: None — `expo-crypto` (55.0.9) is already installed
- **Behavior**: No functional change — batch IDs only need uniqueness, which UUIDs provide
- **Codacy**: Resolves all `weak-random` / `insecure-random` findings for these files
