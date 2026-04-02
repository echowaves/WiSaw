## 1. Fix FriendCard photo fetch

- [x] 1.1 In `src/components/FriendCard/index.js`, derive the friend's user UUID from `friend.uuid1`/`friend.uuid2` and pass it as `friendUuid` to `fetchFriendPhotos` instead of `friend.friendshipUuid`

## 2. Fix friend detail navigation

- [x] 2.1 In `src/screens/FriendsList/index.js` `handleFriendPress`, derive the friend's user UUID and navigate to `/friendships/${friendUserUuid}` with `friendshipUuid` as an additional route param
