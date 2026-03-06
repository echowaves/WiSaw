## 1. Wrap expo-notifications Calls

- [ ] 1.1 Wrap `Notifications.setBadgeCountAsync` in try/catch in `src/screens/PhotosList/index.js` (background task at line ~84)
- [ ] 1.2 Wrap `Notifications.requestPermissionsAsync` in try/catch in `src/screens/PhotosList/index.js` (useEffect at line ~1283)
- [ ] 1.3 Wrap `Notifications.setBadgeCountAsync` in try/catch in `src/screens/PhotosList/components/PhotosListFooter.js` (useEffect at line ~37)

## 2. Fix SafeAreaView Deprecation

- [ ] 2.1 Replace `SafeAreaView` from `react-native` with `SafeAreaView` from `react-native-safe-area-context` in `src/components/SafeAreaView/index.js`
- [ ] 2.2 Replace `SafeAreaView` from `react-native` with `SafeAreaView` from `react-native-safe-area-context` in `src/screens/FriendsList/ConfirmFriendship.js`
- [ ] 2.3 Remove unused `SafeAreaView` import from `react-native` in `src/screens/PhotosList/index.js`

## 3. Verify

- [ ] 3.1 Run Metro bundler to confirm JS bundle compiles without errors
