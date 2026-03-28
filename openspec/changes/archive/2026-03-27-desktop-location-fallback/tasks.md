## 1. Permission request timeout for Mac Catalyst

- [x] 1.1 In `useLocationProvider`, wrap `requestForegroundPermissionsAsync()` in `Promise.race` with a 5s timeout; if it hangs, fall back to `getForegroundPermissionsAsync()` with the same timeout; if both time out, assume `'granted'`
- [x] 1.2 Update the permission-denied alert with dual iOS/Mac text: include both "Open Settings" button and macOS System Settings instructions

## 2. Unblock non-geo feed segments

- [x] 2.1 In `reducer.getPhotos()`, change the `!location` guard to only block segment 0 (geo feed); let segments 1 (watched) and 2 (search) proceed without location
- [x] 2.2 In `PhotosList/index.js`, modify the `if (!location)` early-return block so it only renders the blocking empty state when `activeSegment === 0`; allow segments 1 and 2 to fall through to the normal render path even without location

## 3. PhotosList pending/denied UI for segment 0

- [x] 3.1 Ensure the "Obtaining your location..." banner and "Location access needed" banner are still shown for segment 0 when location is unavailable, but do not block the entire screen when the user is on segments 1 or 2
