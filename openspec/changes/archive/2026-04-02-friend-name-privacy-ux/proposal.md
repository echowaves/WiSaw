## Why

Users don't understand why some friends show as "Unnamed Friend" — the app stores friend names only on-device for privacy but never explains this. Additionally, the confirmed-friend "Share Name" action leaks user-assigned names via deep links, which contradicts the privacy model. The pending friend messaging ("Share the link again to remind them") is misleading — it should explain this is required to establish the connection.

## What Changes

- Remove "Share Name" action from confirmed-friend long-press menu (and associated `ShareFriendNameModal` component and deep link handling code)
- Update pending friend card: change button label from "Remind" to "Share", update explainer text to explain sharing is required to establish connection + friend names never leave device
- Add a "Private by Design" card to the `FriendsExplainerView` empty-state tutorial explaining device-only name storage and new-device behavior
- Add a subtitle on `FriendCard` for unnamed friends: "Long-press to assign a name"

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `pending-friends-card`: Change button label from "Remind" to "Share", update explainer text to describe connection establishment and device-only name privacy
- `friends-explainer`: Add new "Private by Design" tutorial card about device-only name storage
- `friend-card`: Add conditional subtitle for unnamed friends explaining how to assign a name

## Impact

- **Code removed**: `src/components/ShareFriendNameModal.js`, friendship name deep link handlers in `app/_layout.tsx` and `app/friendships/name.tsx`, QR code name functions in `src/utils/qrCodeHelper.js`, link parsing for `friendshipName` type in `src/utils/linkingHelper.js`
- **Code modified**: `src/components/PendingFriendsCard/index.js`, `src/components/FriendsExplainerView/index.js`, `src/components/FriendCard/index.js`, `src/screens/FriendsList/index.js`
- **No backend changes needed**
