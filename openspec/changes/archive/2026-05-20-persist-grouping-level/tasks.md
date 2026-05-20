## 1. Hydrate grouping atom at app startup

- [x] 1.1 Import `hydrateGroupingAtom` from `src/utils/groupingAtom` in `app/_layout.tsx`
- [x] 1.2 Add `hydrateGroupingAtom()` to the `Promise.allSettled` block alongside other parallel loads (theme, sort preferences)
- [x] 1.3 Destructure the result and log hydration success/failure for debugging

## 2. Fix setGroupingLevel to update Jotai atom

- [x] 2.1 In `src/utils/groupingAtom.js`, update `setGroupingLevel()` to call `groupingAtom.write(next)` after saving to AsyncStorage, mirroring the pattern in `updateGroupingAtom`
- [x] 2.2 Ensure the atom update uses the same shape as `updateGroupingAtom` (preserves other fields via spread)

## 3. Export hydrateGroupingAtom from state module

- [x] 3.1 Add `hydrateGroupingAtom` export to `src/state.js` so `_layout.tsx` can import it via `STATE.hydrateGroupingAtom`
- [x] 3.2 Verify existing optional chaining usage in `GroupingSettings/index.js` (`STATE.hydrateGroupingAtom?.()`) continues to work

## 4. Verify end-to-end

- [x] 4.1 Set grouping level to DISTRICT in Settings, close app, restart — verify DISTRICT is selected
- [x] 4.2 Set grouping level to COUNTRY, close app, restart — verify COUNTRY is selected
- [x] 4.3 Verify auto-group uses the correct persisted level after restart
- [x] 4.4 Verify default CITY behavior when no settings exist in AsyncStorage
