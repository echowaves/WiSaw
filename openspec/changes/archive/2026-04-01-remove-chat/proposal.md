## Why

With friends now navigating to a photo feed instead of chat (Phase 2), the chat system is no longer used anywhere in the app. The entire chat codebase — screen, hooks, components, subscriptions, GraphQL operations, and unread tracking — should be removed to reduce bundle size, eliminate dead code, and simplify the friends system.

## What Changes

- **Delete** the entire `src/screens/Chat/` directory (10 files: screen, hooks, components, reducer)
- **Delete** the chat route `app/(drawer)/(tabs)/chat.tsx`
- **Remove** `react-native-gifted-chat` dependency from `package.json`
- **Remove** chat-related constants (`PENDING_UPLOADS_FOLDER_CHAT`, `PENDING_CHAT_UPLOADS_KEY`)
- **Remove** unread count tracking from friends system (`getUnreadCountsList`, `resetUnreadCount`, `friendsUnreadCount` atom, badge indicators)
- **Remove** "Most Recent Chat" sort option from friends list
- **Remove** `chatUuid` from friendship GraphQL queries
- **Clean** chat references in `FriendsList`, `PhotosList`, `FriendsHeaderIcon`, `FriendsExplainerView`, `ConfirmFriendship`, `linkingHelper`, and other affected files

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `friendships`: Remove `chatUuid` from queries, remove chat navigation, remove unread tracking
- `friends-sort`: Remove "Most Recent Chat" sort option
- `friends-header-icon`: Remove unread badge indicator
- `friends-explainer`: Update text to remove chat references

## Impact

- **Code**: 10 files deleted, ~15 files modified
- **Dependencies**: Remove `react-native-gifted-chat`
- **State**: Remove `friendsUnreadCount` atom
- **API**: Stop calling `getUnreadCountsList`, `resetUnreadCount`, `sendMessage`, `getMessagesList`, `onSendMessage` — remove `chatUuid` from friendship queries
- **Sequencing**: Phase 4 of 4. Must be done after Phase 2 (friends list redesign) which reroutes friend tap away from chat
