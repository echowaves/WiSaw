## 1. Remove Share Name from confirmed friends

- [x] 1.1 Remove "Share Name" menu item from confirmed-friend action menu in `src/screens/FriendsList/index.js`
- [x] 1.2 Remove `ShareFriendNameModal` import, state variables (`showShareNameModal`, `shareNameModalData`), and JSX from `src/screens/FriendsList/index.js`
- [x] 1.3 Remove the `isPending === false` path in `handleShareFriend` (or simplify the function since it's only used for pending friends now)

## 2. Update PendingFriendsCard

- [x] 2.1 Change button label from "Remind" to "Share" in `src/components/PendingFriendsCard/index.js`
- [x] 2.2 Update explainer text to "Share this link with your friend to establish the connection. Friend names never leave your device."

## 3. Add privacy card to FriendsExplainerView

- [x] 3.1 Add a "Private by Design" card (icon: `lock`) to the CARDS array in `src/components/FriendsExplainerView/index.js` with body text about device-only name storage

## 4. Add unnamed friend hint on FriendCard

- [x] 4.1 Add conditional subtitle "Long-press to assign a name" below the display name in `src/components/FriendCard/index.js` when `friend.contact` is null/undefined

## 5. Remove dead code

- [x] 5.1 Delete `src/components/ShareFriendNameModal.js`
- [x] 5.2 Remove `friendshipName` case from deep link handler in `app/_layout.tsx`
- [x] 5.3 Delete `app/friendships/name.tsx`
- [x] 5.4 Remove `createFriendshipNameDeepLink`, `createFriendshipNameUniversalLink`, `createFriendshipQRData`, `parseFriendshipQRData`, `parseDeepLinkForFriendshipName` from `src/utils/qrCodeHelper.js`
- [x] 5.5 Remove `friendshipName` parsing from `src/utils/linkingHelper.js`
- [x] 5.6 Remove friendship name tests from `src/utils/__tests__/linkingHelper.test.js`

## 6. Verify

- [x] 6.1 Run lint to confirm no broken imports or unused references
- [x] 6.2 Manually test: confirmed friend long-press menu shows Edit Name + Remove Friend (no Share Name)
- [x] 6.3 Manually test: pending friend card shows "Share" button with updated explainer text
- [x] 6.4 Manually test: empty friends list shows privacy card in tutorial
- [x] 6.5 Manually test: unnamed confirmed friend card shows "Long-press to assign a name" subtitle
