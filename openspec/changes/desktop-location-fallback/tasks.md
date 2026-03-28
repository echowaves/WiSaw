## 1. Location provider timeout fallback

- [x] 1.1 In `useLocationProvider`, add a ~10 second timeout after permission is granted: if the atom is still `pending` (neither fast-seed nor watcher have provided coordinates), call `Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Lowest })` and set the atom to `ready` with the returned coords
- [x] 1.2 Clear the timeout if the atom reaches `ready` before it fires (from fast-seed or watcher), and on unmount cleanup
- [x] 1.3 Replace the `Alert.alert` permission-denied block with platform-aware messaging: on macOS, show instructions for System Settings → Privacy & Security → Location Services instead of the "Open Settings" button (detect via `Platform.OS === 'ios'` and a Mac Catalyst or desktop heuristic, or simply make the alert text work for both)

## 2. Unblock non-geo feed segments

- [x] 2.1 In `reducer.getPhotos()`, change the `!location` guard to only block segment 0 (geo feed); let segments 1 (watched) and 2 (search) proceed without location
- [x] 2.2 In `PhotosList/index.js`, modify the `if (!location)` early-return block so it only renders the blocking empty state when `activeSegment === 0`; allow segments 1 and 2 to fall through to the normal render path even without location

## 3. PhotosList pending/denied UI for segment 0

- [x] 3.1 Ensure the "Obtaining your location..." banner and "Location access needed" banner are still shown for segment 0 when location is unavailable, but do not block the entire screen when the user is on segments 1 or 2
