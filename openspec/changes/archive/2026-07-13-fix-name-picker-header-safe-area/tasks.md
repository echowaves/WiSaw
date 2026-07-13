## 1. Fix NamePicker safe area insets

- [x] 1.1 Import `SafeAreaProvider` from `react-native-safe-area-context` in `src/components/NamePicker/index.js`
- [x] 1.2 Wrap the Modal's inner `View` (the direct child of `<Modal>`) with `<SafeAreaProvider>` so that `AppHeader`'s `SafeAreaView` and the existing `useSafeAreaInsets()` call resolve correct insets

## 2. Update safeareaview-migration spec

- [x] 2.1 Sync delta spec (`openspec/changes/fix-name-picker-header-safe-area/specs/safeareaview-migration/spec.md`) into the main spec at `openspec/specs/safeareaview-migration/spec.md`
