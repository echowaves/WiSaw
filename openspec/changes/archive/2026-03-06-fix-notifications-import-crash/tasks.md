## 1. Create safe notifications wrapper

- [x] 1.1 Create `src/utils/notifications.js` with try/catch around `require('expo-notifications')` and no-op stubs for `setBadgeCountAsync` and `requestPermissionsAsync`

## 2. Update imports and remove redundant try/catch

- [x] 2.1 In `src/screens/PhotosList/index.js`, replace `import * as Notifications from 'expo-notifications'` with import from `../../utils/notifications` and remove redundant try/catch blocks around Notifications calls
- [x] 2.2 In `src/screens/PhotosList/components/PhotosListFooter.js`, replace `import * as Notifications from 'expo-notifications'` with import from `../../../utils/notifications` and remove redundant try/catch block

## 3. Verify

- [x] 3.1 Verify Metro bundle exports successfully
