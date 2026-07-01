## 1. Update offline card subtitle and handler

- [x] 1.1 Add `import * as Location from 'expo-location'` to `src/screens/PhotosList/index.js`
- [x] 1.2 Extract `setLocation = useSetAtom(STATE.locationAtom)` at the component top level (alongside existing `setUngroupedPhotosCount`)
- [x] 1.3 Update offline card subtitle from "You can still take photos offline..." to "You can take photos when your location is determined. They'll be uploaded automatically when you're back online."
- [x] 1.4 Update offline card `onActionPress` from `reload` to `handleTryAgain`
- [x] 1.5 Add `handleTryAgain` callback that:
  - Calls `Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })`
  - Updates `locationAtom` with the fresh coordinates via `setLocation`
  - Catches GPS errors gracefully (logs in `__DEV__` only)
  - Calls `reload()` after GPS check (whether successful or not)
  - Uses `useCallback` with `[reload, setLocation]` dependencies
