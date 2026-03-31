## Why

The recent move-friends-to-header change introduced three visual issues: the Friends and Waves icons are in the wrong order, the Friends icon coloring logic doesn't match Waves (it should highlight when the user has friends, not only on unread), and removing the fourth footer button shifted the remaining camera buttons off-center.

## What Changes

- Swap the order of Friends and Waves icons in the header right-side row (Friends first, then Waves)
- Update `FriendsHeaderIcon` coloring to mirror `WaveHeaderIcon`: icon turns `MAIN_COLOR` when the user has any friends (reads `friendsList` atom), red dot badge appears only when unread count > 0
- Absolutely position the menu button in the footer (like the header's identity icon) so the video and camera buttons are visually centered in the full footer width

## Capabilities

### New Capabilities

(none)

### Modified Capabilities
- `friends-header-icon`: Icon color driven by "has friends" (friendsList.length > 0) instead of "has unread". Badge remains for unread count > 0.
- `photo-feed`: Header icon order swapped (Friends, Waves). Footer menu button absolutely positioned left; video and camera buttons centered.

## Impact

- `src/components/FriendsHeaderIcon/index.js` — new atom read, coloring logic change
- `src/screens/PhotosList/components/PhotosListHeader.js` — swap icon order
- `src/screens/PhotosList/components/PhotosListFooter.js` — restructure layout
