## 1. Fix GraphQL Mutation Query

- [x] 1.1 Remove nested `friendship { }` wrapper from `createFriendship` mutation in `src/screens/FriendsList/reducer.js` — query `friendshipUuid`, `uuid1`, `uuid2`, `createdAt` directly on the mutation return type

## 2. Fix Response Handling

- [x] 2.1 Change result destructuring from `const { friendship } = (...).data.createFriendship` to `const friendship = (...).data.createFriendship` in `src/screens/FriendsList/reducer.js`

## 3. Verify

- [x] 3.1 Manually test creating a new friendship and confirm `friendshipUuid` is correctly returned and used for contact name saving
