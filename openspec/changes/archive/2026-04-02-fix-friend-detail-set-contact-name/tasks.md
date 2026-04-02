## 1. Fix setContactName signature

- [x] 1.1 Change `setContactName` in `src/screens/FriendDetail/index.js` from `async (name)` to `async ({ contactName })` and update internal references from `name` to `contactName`

## 2. Verify

- [x] 2.1 Manually test renaming a friend from the FriendDetail screen via NamePicker
