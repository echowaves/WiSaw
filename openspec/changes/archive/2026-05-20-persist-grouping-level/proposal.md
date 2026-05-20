## Why

The `groupingLevel` setting (DISTRICT, CITY, REGION, COUNTRY) is not persisting across app restarts. Users change their grouping preference in Settings, close the app, and upon relaunch the setting resets to the default (CITY). This breaks user expectations and forces repeated configuration. The bug has two root causes: `hydrateGroupingAtom()` is never called at app startup, and `setGroupingLevel()` saves to AsyncStorage but fails to update the Jotai atom, so subscribers never re-render.

## What Changes

- Call `hydrateGroupingAtom()` during app initialization in `app/_layout.tsx` alongside other parallel loads (theme, sort preferences, etc.)
- Fix `setGroupingLevel()` in `src/utils/groupingAtom.js` to update the Jotai `groupingAtom` after saving to AsyncStorage, ensuring all Jotai subscribers re-render
- Add `hydrateGroupingAtom` export to `STATE` module so `_layout.tsx` can import it

## Capabilities

### Modified Capabilities
- `auto-group-photos`: The auto-group feature reads `groupingLevel` from `groupingAtom` at runtime. If the atom is not hydrated at startup, auto-group uses the wrong default level. This change ensures the stored grouping level is available before any auto-group operation reads it.

## Impact

- **Files modified:**
  - `app/_layout.tsx` — add `hydrateGroupingAtom()` call in the `Promise.allSettled` initialization block
  - `src/utils/groupingAtom.js` — fix `setGroupingLevel()` to call `set(groupingAtom, next)` after AsyncStorage write
  - `src/state.js` — export `hydrateGroupingAtom` for use in `_layout.tsx`
- **No API changes** — purely client-side persistence fix
- **No new dependencies** — uses existing AsyncStorage + Jotai infrastructure
