## 1. Delete Chat Code

- [x] 1.1 Delete `src/screens/Chat/` directory (index.js, ChatComponents.js, ChatPhoto.js, reducer.js, useMessages.js, useChatSubscription.js, useChatDeletion.js, useMediaUpload.js, useSwipeGesture.js)
- [x] 1.2 Delete `app/(drawer)/(tabs)/chat.tsx` route file
- [x] 1.3 Remove `chat` screen entry from `app/(drawer)/(tabs)/_layout.tsx`

## 2. Remove Dependencies

- [x] 2.1 Remove `react-native-gifted-chat` from `package.json` and run `npm install`

## 3. Clean State and Constants

- [x] 3.1 Remove `friendsUnreadCount` atom from `src/state.js`
- [x] 3.2 Remove `PENDING_UPLOADS_FOLDER_CHAT` and `PENDING_CHAT_UPLOADS_KEY` from `src/consts.js`
- [x] 3.3 Remove `chat` deep link mapping from `src/utils/linkingHelper.js`

## 4. Clean Friends System

- [x] 4.1 Remove `getUnreadCountsList`, `resetUnreadCount`, and `chatUuid` fields from `src/screens/FriendsList/friends_helper.js` GraphQL queries
- [x] 4.2 Remove `reloadUnreadCountsList`, unread state, and `chatUuid` from `src/screens/FriendsList/reducer.js`
- [x] 4.3 Remove chat navigation, `chatUuid` params, unread count display, and "Most Recent Chat" sort from `src/screens/FriendsList/index.js`
- [x] 4.4 Remove `reloadUnreadCountsList` call from `src/screens/FriendsList/ConfirmFriendship.js`
- [x] 4.5 Remove "Most Recent Chat" sort option from `app/(drawer)/friends.tsx`

## 5. Clean Other Screens

- [x] 5.1 Remove `getUnreadCountsList` calls, `unreadCountList` state, and `setFriendsUnreadCount` from `src/screens/PhotosList/index.js`
- [x] 5.2 Remove `unreadCount` prop from `src/screens/PhotosList/components/PhotosListEmptyState.js`
- [x] 5.3 Remove `friendsUnreadCount` atom usage and unread badge from `src/components/FriendsHeaderIcon/index.js`
- [x] 5.4 Update chat-related text in `src/components/FriendsExplainerView/index.js` to reference photo sharing
- [x] 5.5 Remove `unreadCount={0}` prop from `src/screens/WaveDetail/index.js`
