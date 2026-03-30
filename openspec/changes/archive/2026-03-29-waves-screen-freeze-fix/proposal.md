## Why

The Waves screen freezes when the user navigates from the search photos segment (with keyboard active) to the Waves list. The root cause: the keyboard-dismiss animation runs concurrently with the Drawer navigation transition, and the WavesHub screen mounts `KeyboardStickyView` / `KeyboardAvoidingView` (from `react-native-keyboard-controller`) mid-animation. These components use Reanimated worklets that react to keyboard events — mounting them while the keyboard is still animating closed saturates the JS thread and freezes the UI.

A secondary issue: several components use `useAtom` for atoms they only write to, causing unnecessary re-render subscriptions.

## What Changes

- Dismiss the keyboard in PhotosList's `useFocusEffect` cleanup — ensures the keyboard is fully dismissed before the destination screen mounts, preventing keyboard-animation conflicts with `react-native-keyboard-controller` worklets
- Replace `useAtom` with `useSetAtom` at all write-only atom consumer sites for `wavesCount` and `ungroupedPhotosCount` — eliminates phantom re-render subscriptions

## Capabilities

### New Capabilities

_None_

### Modified Capabilities

- `waves-global-state`: Atom consumers that only write (never read) must use `useSetAtom` instead of `useAtom` to avoid unnecessary re-render subscriptions

## Impact

- `src/screens/PhotosList/index.js` — dismiss keyboard on focus loss, switch to `useSetAtom` for ungroupedPhotosCount
- `src/screens/WavesHub/index.js` — switch to `useSetAtom` for wavesCount and ungroupedPhotosCount
- `app/(drawer)/waves/index.tsx` — switch to `useSetAtom` for wavesCount
- `src/hooks/usePhotoActions.js` — switch to `useSetAtom` for ungroupedPhotosCount
