## 1. Update imports and storage functions

- [x] 1.1 Add `expo-secure-store` import to `src/screens/FriendsList/friends_helper.js`
- [x] 1.2 Update `getLocalContact` to check secure store first, fall back to expo-storage with lazy migration (write to secure store, delete from expo-storage), and handle migration failures gracefully
- [x] 1.3 Update `addFriendshipLocally` to write to `expo-secure-store` and clean up any existing expo-storage entry
- [x] 1.4 Update `deleteFriendship` to delete from both `expo-secure-store` and `expo-storage`
- [x] 1.5 Update `testStorage` to test `expo-secure-store` operations

## 2. Verify

- [x] 2.1 Confirm the app compiles without errors
- [x] 2.2 Test adding a new friend name, verify it's stored in secure store
- [x] 2.3 Test reading an existing expo-storage friend name, verify it migrates to secure store
