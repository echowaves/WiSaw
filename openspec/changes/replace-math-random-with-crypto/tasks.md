## 1. Replace Math.random() in Wave Screens

- [x] 1.1 In `src/screens/WaveDetail/index.js`, add `import * as Crypto from 'expo-crypto'` and replace all 3 `String(Math.random())` calls with `Crypto.randomUUID()`
- [x] 1.2 In `src/screens/WavesHub/index.js`, add `import * as Crypto from 'expo-crypto'` and replace all 3 `String(Math.random())` calls with `Crypto.randomUUID()`
- [x] 1.3 In `src/screens/Waves/index.js`, add `import * as Crypto from 'expo-crypto'` and replace all 3 `String(Math.random())` calls with `Crypto.randomUUID()`

## 2. Replace Math.random() in Other Components

- [x] 2.1 In `src/screens/PhotoSelectionMode/index.js`, add `import * as Crypto from 'expo-crypto'` and replace both `String(Math.random())` calls with `Crypto.randomUUID()`
- [x] 2.2 In `src/screens/WavesHub/reducer.js`, add `import * as Crypto from 'expo-crypto'` and replace the `String(Math.random())` call with `Crypto.randomUUID()`
- [x] 2.3 In `src/components/WaveSelectorModal/index.js`, add `import * as Crypto from 'expo-crypto'` and replace the `String(Math.random())` call with `Crypto.randomUUID()`

## 3. Verification

- [x] 3.1 Run Codacy CLI analysis on all 6 modified files and confirm no `weak-random` / `insecure-random` findings remain
