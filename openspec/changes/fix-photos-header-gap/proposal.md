## Why

The previous fix (fix-android-emulator-errors) changed `SafeAreaView` imports in several files from `react-native` to `react-native-safe-area-context`. However, these files also apply `safeAreaViewStyle` from `useSafeAreaViewStyle()`, which adds manual `paddingTop: statusBarHeight` on Android. Since `react-native-safe-area-context`'s `SafeAreaView` already applies safe area insets automatically, the combination produces **double top padding** on Android — creating a visible gap between the header and the photo feed.

## What Changes

- Remove `useSafeAreaViewStyle` usage from files that now use `react-native-safe-area-context`'s `SafeAreaView` (which auto-handles insets): `PhotosList/index.js`, `ConfirmFriendship.js`
- Fix the custom `SafeAreaView` wrapper component (`src/components/SafeAreaView/index.js`) to stop adding redundant padding since it already wraps `react-native-safe-area-context`'s `SafeAreaView`
- Migrate remaining files (`Chat/index.js`, `Secret/index.js`) that still import `SafeAreaView` from `react-native` to use `react-native-safe-area-context` instead, and remove their `useSafeAreaViewStyle` usage
- Remove the `useSafeAreaViewStyle` hook from `src/hooks/useStatusBarHeight.js` once no consumers remain

## Capabilities

### New Capabilities
- `safe-area-consistency`: Consistent SafeAreaView usage across the app — all screens use `react-native-safe-area-context` without manual padding workarounds

### Modified Capabilities

## Impact

- `src/screens/PhotosList/index.js` — remove `safeAreaViewStyle` from header
- `src/screens/FriendsList/ConfirmFriendship.js` — remove `safeAreaViewStyle` usage
- `src/components/SafeAreaView/index.js` — simplify to pass-through
- `src/screens/Chat/index.js` — migrate SafeAreaView import, remove `useSafeAreaViewStyle`
- `src/screens/Secret/index.js` — migrate SafeAreaView import, remove `useSafeAreaViewStyle`
- `src/hooks/useStatusBarHeight.js` — remove `useSafeAreaViewStyle` export
