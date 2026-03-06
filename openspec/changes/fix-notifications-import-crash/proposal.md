## Why

The `import * as Notifications from 'expo-notifications'` statement at the top of `PhotosList/index.js` and `PhotosListFooter.js` crashes at module load time in Expo Go SDK 53+, because `expo-notifications` Android push notification functionality was removed from Expo Go. The previous fix (wrapping API calls in try/catch) is insufficient — the error occurs at import time before any API call is reached, preventing the app from loading on Android emulator.

## What Changes

- Create a safe notifications wrapper module (`src/utils/notifications.js`) that uses a top-level try/catch around `require('expo-notifications')` and exports no-op stubs when the module is unavailable
- Replace all `import * as Notifications from 'expo-notifications'` with imports from the safe wrapper
- Remove the now-redundant try/catch blocks around individual Notifications API calls added in the previous fix

## Capabilities

### New Capabilities
- `safe-notifications-import`: A wrapper module that safely loads expo-notifications with graceful fallback when unavailable (e.g., in Expo Go SDK 53+)

### Modified Capabilities

## Impact

- `src/screens/PhotosList/index.js` — change import source
- `src/screens/PhotosList/components/PhotosListFooter.js` — change import source
- `src/utils/notifications.js` — new file (safe wrapper)
