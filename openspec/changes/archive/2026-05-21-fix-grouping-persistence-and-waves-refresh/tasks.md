## 1. Fix Grouping Atom Hydration

- [x] 1.1 In `app/_layout.tsx`, add `useSetAtom(groupingAtom)` and call it with the hydrated settings object inside the `initialize()` function, after `hydrateGroupingAtom()` resolves — so `groupingAtom` reflects the persisted `enabled` value immediately
- [x] 1.2 Import `groupingAtom` from `src/utils/groupingAtom` in `app/_layout.tsx`

## 2. Fix Grouping-Disabled Capture Path

- [x] 2.1 In `src/screens/PhotosList/hooks/useCameraCapture.js`, when `grouping.enabled` is `false`, call `enqueueCapture` without `waveUuid` (drop it entirely) instead of passing it through from the caller

## 3. Fix Waves List Focus Refresh

- [x] 3.1 In `src/screens/WavesHub/index.js`, remove the `useCallback` wrapper from the callback passed to `useFocusEffect`, so the data-fetch runs on every focus event
