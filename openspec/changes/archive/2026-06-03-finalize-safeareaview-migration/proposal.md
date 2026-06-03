## Why

The `SafeAreaView` deprecation warning from `react-native` still appears at runtime. Two files were missed in the previous migration wave (archived `2026-04-09-fix-deprecated-safeareaview`):

- `src/screens/Secret/index.js` — imports `SafeAreaView` from `react-native`
- `src/screens/PhotosList/components/PhotosListFooter.js` — imports `SafeAreaView` from `react-native`

Both files already import other symbols from `react-native-safe-area-context`, so the package is already a dependency. The fix is a straightforward import swap, plus cleanup of the now-redundant `useSafeAreaViewStyle` hook usage in the Secret screen.

## What Changes

- Replace `SafeAreaView` import from `react-native` → `react-native-safe-area-context` in both files
- Remove `useSafeAreaViewStyle` usage in `Secret/index.js` — the `react-native-safe-area-context` SafeAreaView handles padding automatically
- Remove the now-unused `useSafeAreaViewStyle` export from `useStatusBarHeight.js` hook

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `safeareaview-migration`: Extends the existing spec to cover the remaining two files

## Impact

- **Code**: `src/screens/Secret/index.js`, `src/screens/PhotosList/components/PhotosListFooter.js`, `src/hooks/useStatusBarHeight.js`
- **Dependencies**: No new dependencies
- **Runtime**: Eliminates the deprecation warning; no functional change
