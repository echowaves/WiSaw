## 1. Add updatedAt to GraphQL query

- [x] 1.1 Add `updatedAt` field to the `photos` sub-selection in `getRemoteListOfFriendships` query in `src/screens/FriendsList/friends_helper.js`

## 2. Update sort logic in FriendsList

- [x] 2.1 Replace the `createdAt` sort comparator in the `useMemo` in `src/screens/FriendsList/index.js` with a comparator that uses the most recent photo's `updatedAt`
- [x] 2.2 Add fallback to friendship `createdAt` when a friend has no photos or no `updatedAt` value

## 3. Update the main friends-sort spec

- [x] 3.1 Update `openspec/specs/friends-sort/spec.md` to remove stale sort picker and Jotai atom references, and reflect the fixed sort by latest photo `updatedAt`
