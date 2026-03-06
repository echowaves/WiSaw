## 1. Fix files already using react-native-safe-area-context (double padding)

- [ ] 1.1 In `src/screens/PhotosList/index.js`, remove `useSafeAreaViewStyle` import and usage, remove `safeAreaViewStyle` from the header SafeAreaView style array
- [ ] 1.2 In `src/screens/FriendsList/ConfirmFriendship.js`, remove `useSafeAreaViewStyle` import and usage, remove `safeAreaViewStyle` from SafeAreaView style
- [ ] 1.3 In `src/components/SafeAreaView/index.js`, remove `useSafeAreaViewStyle` import and pass style directly to the underlying SafeAreaView

## 2. Migrate remaining files from react-native SafeAreaView

- [ ] 2.1 In `src/screens/Chat/index.js`, change `SafeAreaView` import from `react-native` to `react-native-safe-area-context`, remove `useSafeAreaViewStyle` import and usage
- [ ] 2.2 In `src/screens/Secret/index.js`, change `SafeAreaView` import from `react-native` to `react-native-safe-area-context`, remove `useSafeAreaViewStyle` import and usage

## 3. Remove obsolete hook

- [ ] 3.1 Remove the `useSafeAreaViewStyle` export from `src/hooks/useStatusBarHeight.js`

## 4. Verify

- [ ] 4.1 Verify Metro bundle exports successfully
