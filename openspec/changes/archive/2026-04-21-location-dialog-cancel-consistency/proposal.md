## Why

The location-denied permission alert in `useLocationProvider.js` uses `[Open Settings] [OK]` buttons, while every other permission-denied alert in the app (camera, photo library) uses `[Cancel] [Open Settings]` with `style: 'cancel'`. Additionally, the location-denied `EmptyStateCard` in the photo feed has no way to dismiss — users who decline location access are stuck seeing the nudge card with no cancel option.

## What Changes

- Replace the location-denied `Alert.alert` buttons from `[Open Settings, OK]` to `[Cancel (style: cancel), Open Settings]` — matching the camera and photo library permission alerts.
- Add a Cancel/dismiss button to the location-denied `EmptyStateCard` in the photo feed. When tapped, the card transitions to a simpler "Unable to show nearby photos without location access" empty state using the `location-off` icon.

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `location-services`: The location-denied alert button configuration changes from `[Open Settings, OK]` to `[Cancel, Open Settings]` with cancel style.
- `photo-feed`: The location-denied empty state card gains a secondary "Cancel" action that transitions to a dismissed state with different messaging.

## Impact

- `src/hooks/useLocationProvider.js` — Alert button array change
- `src/screens/PhotosList/index.js` — Add dismissed state, update EmptyStateCard usage for denied state
