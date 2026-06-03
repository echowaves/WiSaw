## 1. Update Secret screen SafeAreaView import

- [x] 1.1 In `src/screens/Secret/index.js`, remove `SafeAreaView` from the `react-native` import
- [x] 1.2 Add `SafeAreaView` to the `react-native-safe-area-context` import (or create one if needed)
- [x] 1.3 Remove the `useSafeAreaViewStyle` import from `../../hooks/useStatusBarHeight`
- [x] 1.4 Remove the `const safeAreaViewStyle = useSafeAreaViewStyle()` line
- [x] 1.5 Update all 4 `<SafeAreaView>` usages to use `style={styles.container}` instead of `style={[styles.container, safeAreaViewStyle]}`

## 2. Update PhotosListFooter SafeAreaView import

- [x] 2.1 In `src/screens/PhotosList/components/PhotosListFooter.js`, remove `SafeAreaView` from the `react-native` import
- [x] 2.2 Add `SafeAreaView` to the existing `react-native-safe-area-context` import

## 3. Clean up useStatusBarHeight hook

- [x] 3.1 In `src/hooks/useStatusBarHeight.js`, remove the `useSafeAreaViewStyle` export
- [x] 3.2 Verify `useStatusBarHeight` is still used (it is, by `useToastTopOffset.js`)

## 4. Verify no remaining deprecated imports

- [x] 4.1 Confirm no remaining `SafeAreaView` imports from `react-native` in the codebase (excluding docs)
- [x] 4.2 Run the app and confirm the deprecation warning no longer appears
