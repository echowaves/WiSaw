## Why

Apple rejected WiSaw v7.5.4 under Guideline 5.1.1(iv) because the camera permission denial alert only presents an "Open Settings" button with no way to dismiss. This forces the user into a single action path after denial, which Apple considers pressuring users to reconsider their decision. Adding a "Cancel" button gives users a clear alternative to dismiss the alert without taking any action.

## What Changes

- Add a "Cancel" button (with `style: 'cancel'`) to the camera permission denied alert in `useCameraCapture.js`
- Add a "Cancel" button to the photo library permission denied alert in `useCameraCapture.js`
- Add a "Cancel" button to the camera permission denied alert in `WaveDetail/index.js`
- Add a "Cancel" button to the photo library permission denied alert in `WaveDetail/index.js`

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `location-services`: Camera and photo library permission denial alerts must include a dismissable "Cancel" button alongside "Open Settings"

## Impact

- `src/screens/PhotosList/hooks/useCameraCapture.js` — `checkPermission()` function's `Alert.alert` call
- `src/screens/WaveDetail/index.js` — two inline `Alert.alert` calls for camera and library permissions
