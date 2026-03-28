## Why

When running WiSaw as a native app on macOS (via App Store / Mac Catalyst), the app gets stuck on "Finding Your Location..." indefinitely. Permission is granted, but `watchPositionAsync` never fires its callback because the Mac is stationary (distanceInterval/timeInterval conditions aren't met on desktop). Additionally, the photo feed blocks all three segments (geo, watched, search) when location is unavailable, even though only the geo segment needs coordinates.

## What Changes

- Add a timeout-based fallback in `useLocationProvider`: if no position is received within ~10 seconds of permission being granted, use `getCurrentPositionAsync` with lowest accuracy to force CoreLocation to resolve from WiFi positioning
- Unblock watched photos (segment 1) and search (segment 2) in the feed reducer so they load even without location — only the geo feed (segment 0) should require coordinates
- Replace the `Alert.alert` permission-denied UI with platform-appropriate messaging on macOS (the "Open Settings" button doesn't navigate to the correct macOS settings pane)
- Camera remains blocked until a valid non-zero location is obtained (photos require lat/lon for upload)

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `location-provider`: Add timeout fallback using `getCurrentPositionAsync` when watcher doesn't provide position within ~10 seconds; platform-appropriate permission-denied messaging for macOS
- `photo-feed`: Unblock watched and search segments when location is unavailable — only geo feed requires location

## Impact

- Modified: `src/hooks/useLocationProvider.js` — add position timeout fallback and macOS-aware denied UI
- Modified: `src/screens/PhotosList/reducer.js` — narrow the `!location` guard to segment 0 only
- Modified: `src/screens/PhotosList/index.js` — show appropriate UI when location is unavailable but non-geo segments can still load
