## 1. Add state and refetch logic to route screen

- [x] 1.1 Add `useState` for `frozen` and `role` in `app/(drawer)/waves/[waveUuid].tsx`, initialized from route params (`isFrozen === '1'` and `myRole`)
- [x] 1.2 Add `useFocusEffect` that calls `getWave({ waveUuid, uuid })` and updates `frozen` and `role` state from the response; silently catch errors to retain stale state
- [x] 1.3 Add necessary imports: `useFocusEffect` from `expo-router`, `useCallback` from `react`, `getWave` from waves reducer, `uuid` atom from state

## 2. Wire state to header and WaveDetail

- [x] 2.1 Replace static `isFrozen === '1'` and `myRole` route param reads with the `frozen` and `role` state variables for the header snowflake icon and role badge
- [x] 2.2 Pass `frozen` and `role` state to `<WaveDetail isFrozen={frozen} myRole={role} />` instead of route-param-derived values

## 3. Verify

- [x] 3.1 Test: navigate to a frozen wave → go to WaveSettings → change freeze date to future → go back → confirm frozen banner and snowflake disappear
- [x] 3.2 Test: navigate to an unfrozen wave → go to WaveSettings → set freeze date to past → go back → confirm frozen banner and snowflake appear
