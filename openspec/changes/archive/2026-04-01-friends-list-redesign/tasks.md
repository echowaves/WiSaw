## 1. FriendCard Component

- [x] 1.1 Create `src/components/FriendCard/index.js` mirroring `WaveCard` structure: `WavePhotoStrip` with `initialPhotos` from `friend.photos` and `fetchFn` from `fetchFriendPhotos`, info row with friend name and menu button, `onPress`/`onLongPress` props
- [x] 1.2 Wire `onPhotoPress` and `onPhotoLongPress` on `WavePhotoStrip` (same pattern as `WaveCard`)

## 2. PendingFriendsCard Component

- [x] 2.1 Create `src/components/PendingFriendsCard/index.js` with dashed-border card styling matching `UngroupedPhotosCard`, header with clock icon and "Pending Friends (N)" count
- [x] 2.2 Render each pending friend with name, "Waiting for confirmation" status, explanation text, and "Remind" button
- [x] 2.3 Wire "Remind" button to open `ShareOptionsModal` with the friendship UUID

## 3. FriendsList Rewiring

- [x] 3.1 Replace inline friend item rendering in `src/screens/FriendsList/index.js` with `FriendCard` for confirmed friends
- [x] 3.2 Extract pending friends from the sorted list and render `PendingFriendsCard` as `ListHeaderComponent`
- [x] 3.3 Change friend tap navigation from `/chat` to `/friendships/[friendUuid]` passing `friendName` param
- [x] 3.4 Remove unread message count display from friend rendering
- [x] 3.5 Update `getFriendshipsList` GraphQL query to request `photos { id thumbUrl }` field on each friendship
