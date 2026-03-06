## Why

Running the app on Android emulator in Expo Go produces a crash and multiple warnings:

1. **CRASH**: `expo-notifications` was removed from Expo Go in SDK 53+. The top-level `import * as Notifications from 'expo-notifications'` in `PhotosList/index.js` and `PhotosListFooter.js` fails at import time, preventing the app from loading.
2. **WARNING**: `SafeAreaView` from `react-native` is deprecated. Three files still import it directly instead of using `react-native-safe-area-context`.

## What Changes

- Wrap all `expo-notifications` API calls with try/catch to gracefully handle unavailability in Expo Go
- Replace deprecated `SafeAreaView` from `react-native` with `SafeAreaView` from `react-native-safe-area-context` in all affected files
- Update the custom `SafeAreaView` wrapper component to use the non-deprecated source

## Capabilities

### New Capabilities
- `graceful-notifications`: Gracefully handle expo-notifications unavailability in Expo Go

### Modified Capabilities

## Impact

- `src/screens/PhotosList/index.js` — wrap Notifications calls in try/catch
- `src/screens/PhotosList/components/PhotosListFooter.js` — wrap Notifications calls in try/catch
- `src/components/SafeAreaView/index.js` — switch from `react-native` SafeAreaView to `react-native-safe-area-context`
- `src/screens/FriendsList/ConfirmFriendship.js` — switch SafeAreaView import
- `src/screens/PhotosList/index.js` — remove unused SafeAreaView import from `react-native`
