## Why

`FriendCard` and `handleFriendPress` pass `friend.friendshipUuid` (the relationship ID) where the backend expects the friend's **user UUID** (`uuid1` or `uuid2`). This causes `feedForFriend` to fail with "No accepted friendship exists between these users" and triggers an infinite error loop on the friends list screen. The `WavePhotoStrip` in each `FriendCard` retries the failed fetch, causing repeated errors.

## What Changes

- Compute the friend's user UUID from the friendship object (`friend.uuid1 === currentUserUuid ? friend.uuid2 : friend.uuid1`) and pass it correctly to `fetchFriendPhotos` in `FriendCard`
- Pass the friend's user UUID (not `friendshipUuid`) as the route param when navigating to the friend detail screen
- Pass `friendshipUuid` as a separate route param so the detail screen still has access to it for name editing and removal

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `friend-photo-feed`: Fix the `friendUuid` parameter passed to `feedForFriend` in both `FriendCard` photo strip fetch and friend detail navigation

## Impact

- **Code**: `src/components/FriendCard/index.js`, `src/screens/FriendsList/index.js`
- **API**: No API changes — the backend query already expects a user UUID; we're just passing the correct value now
- **Severity**: Critical — friends list is completely broken without this fix
