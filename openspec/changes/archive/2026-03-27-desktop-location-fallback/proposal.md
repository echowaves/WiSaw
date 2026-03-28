## Why

When running WiSaw as a native app on macOS (via App Store / Mac Catalyst), the app gets stuck on "Finding Your Location..." indefinitely. The root cause is that `Location.requestForegroundPermissionsAsync()` hangs forever on Mac Catalyst — the native bridge call never resolves. This blocks all subsequent location code. Additionally, the photo feed blocks all three segments (geo, watched, search) when location is unavailable, even though only the geo segment needs coordinates.

## What Changes

- Wrap `requestForegroundPermissionsAsync()` with a 5-second `Promise.race` timeout; if it hangs (Mac Catalyst), fall back to `getForegroundPermissionsAsync()` (check-only) which works correctly on Mac
- Unblock watched photos (segment 1) and search (segment 2) in the feed reducer so they load even without location — only the geo feed (segment 0) should require coordinates
- Update the permission-denied alert with dual iOS/Mac instructions (both "Open Settings" button and macOS System Settings text)
- Camera remains blocked until a valid non-zero location is obtained (photos require lat/lon for upload)

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `location-provider`: Add permission request timeout with `getForegroundPermissionsAsync` fallback for Mac Catalyst; platform-aware permission-denied messaging
- `photo-feed`: Unblock watched and search segments when location is unavailable — only geo feed requires location

## Impact

- Modified: `src/hooks/useLocationProvider.js` — permission timeout fallback and dual iOS/Mac denied alert
- Modified: `src/screens/PhotosList/reducer.js` — narrow the `!location` guard to segment 0 only
- Modified: `src/screens/PhotosList/index.js` — only block segment 0 when location unavailable; segments 1/2 render normally
