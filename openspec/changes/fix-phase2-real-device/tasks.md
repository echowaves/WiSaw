## 1. Transition Guard

- [x] 1.1 Add a `let phase2Transitioned = false` flag inside `startPhase2()` and add an early-return guard at the top of `transitionToPhase3()` that checks and sets this flag

## 2. Timeout Increase

- [x] 2.1 Change `REFINE_TIMEOUT_MS` from `30000` to `60000` in `src/hooks/useLocationProvider.js`
