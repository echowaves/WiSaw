## 1. Fix GraphQL Mutation

- [x] 1.1 Remove the `friendship` wrapper field from the `acceptFriendshipRequest` mutation selection set in `src/screens/FriendsList/friends_helper.js`
- [x] 1.2 Fix the result destructuring to read `result.data.acceptFriendshipRequest` directly instead of destructuring a `friendship` property from it

## 2. Verify

- [x] 2.1 Confirm the mutation selection set matches the `createFriendship` pattern in `src/screens/FriendsList/reducer.js` (flat fields: `createdAt`, `friendshipUuid`, `uuid1`, `uuid2`)
- [x] 2.2 Confirm the return value shape `{ friendship }` is preserved so `ConfirmFriendship.js` callers are unaffected
