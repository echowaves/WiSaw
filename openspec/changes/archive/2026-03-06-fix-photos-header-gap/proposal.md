## Why

A previous fix (fix-android-emulator-errors) changed the `SafeAreaView` import in `PhotosList/index.js` from `react-native` to `react-native-safe-area-context`. The `react-native-safe-area-context` version applies safe area insets on **all edges** by default (top, bottom, left, right), while the old `react-native` version only handled top insets on iOS. This means the header's `SafeAreaView` now adds bottom safe area padding (e.g. ~34px on iPhones with home indicator), creating a visible gap between the header and the photo feed below it.

Additionally, `safeAreaViewStyle` from `useSafeAreaViewStyle()` still adds manual `paddingTop: statusBarHeight` on Android, which doubles the top inset that `react-native-safe-area-context` already handles automatically — adding extra space above the header content on Android.

## What Changes

- Add `edges={['top']}` to the header's `SafeAreaView` in `PhotosList/index.js` so only the top safe area inset is applied (not bottom/left/right)
- Remove the redundant `safeAreaViewStyle` from the header style since `react-native-safe-area-context` already handles top inset automatically
- Apply the same `edges` fix to other screens that use `SafeAreaView` from `react-native-safe-area-context` with `safeAreaViewStyle` (ConfirmFriendship)
- Fix the custom `SafeAreaView` wrapper component which also double-pads via `useSafeAreaViewStyle`
- Migrate remaining screens (Chat, Secret) from deprecated `react-native` SafeAreaView to `react-native-safe-area-context` with proper `edges` configuration
- Remove `useSafeAreaViewStyle` hook once no consumers remain

## Capabilities

### New Capabilities
- `safe-area-edge-control`: Correct SafeAreaView usage with explicit edge control to prevent unwanted inset padding

### Modified Capabilities

## Impact

- `src/screens/PhotosList/index.js` — header SafeAreaView: add `edges={['top']}`, remove `safeAreaViewStyle`
- `src/screens/FriendsList/ConfirmFriendship.js` — add `edges={['top']}`, remove `safeAreaViewStyle`
- `src/components/SafeAreaView/index.js` — remove `useSafeAreaViewStyle`, pass style through directly
- `src/screens/Chat/index.js` — migrate to `react-native-safe-area-context`, remove `useSafeAreaViewStyle`
- `src/screens/Secret/index.js` — migrate to `react-native-safe-area-context`, remove `useSafeAreaViewStyle`
- `src/hooks/useStatusBarHeight.js` — remove `useSafeAreaViewStyle` export
