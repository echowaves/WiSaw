## 1. Fix Phase 3 Accuracy Gate

- [x] 1.1 Add `storedAccuracyRef.current = Infinity` inside `transitionToPhase3()` in `src/hooks/useLocationProvider.js`, before `startPhase3()` is called

## 2. Development Logging

- [x] 2.1 Add `__DEV__` console logs at Phase 1 seed (accuracy + coords), Phase 2 start, Phase 2 callback (accuracy, coords, accepted/rejected), Phase 2→3 transition, and Phase 3 callback (accuracy, coords, accepted/rejected) in `src/hooks/useLocationProvider.js`
