## Why

The pending friend row in `PendingFriendsCard` only exposes the ActionMenu (Share Link / Cancel Request) via long-press, which is not discoverable. Confirmed friend cards already have a visible kebab `⋮` button — pending friends should mirror this pattern for consistency and discoverability.

## What Changes

- Add a kebab (`ellipsis-vertical`) button to the bottom-right of each pending friend row in `PendingFriendsCard`, triggering the same `onLongPress(friend)` callback that opens the ActionMenu

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `pending-friends-card`: Add kebab menu button to each pending friend row

## Impact

- **Code**: `src/components/PendingFriendsCard/index.js` — add `Ionicons` import and kebab `TouchableOpacity` to each friend row
