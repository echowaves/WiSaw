## Why

The friends list is currently a text-only list that navigates to chat. With the friend photo feed now available (Phase 1), the friends list should become a visual, card-based list — matching the waves list design. Confirmed friends get photo-preview cards (like WaveCard), pending friends get a grouped card (like UngroupedPhotosCard), and tapping a friend navigates to their photo feed instead of chat.

## What Changes

- Replace text-only friend items with `FriendCard` components that include a `WavePhotoStrip` showing the friend's recent photos
- Create `PendingFriendsCard` component grouping all pending friends into a single dashed-border card (mirroring `UngroupedPhotosCard` design) with "Waiting for confirmation" status, a "Remind" button (re-shares invitation link), and explanation text about what happens when the friend confirms
- Change friend tap action from navigating to `/chat` to navigating to `/friendships/[friendUuid]` (friend photo feed)
- Remove unread message count display from friend items (chat is being removed in Phase 4)

## Capabilities

### New Capabilities

- `friend-card`: Visual card component for confirmed friends with photo strip preview, friend name, and context menu
- `pending-friends-card`: Grouped card for pending friend requests mirroring `UngroupedPhotosCard` design pattern

### Modified Capabilities

- `friendships`: Friend tap navigates to photo feed instead of chat; pending friends displayed as grouped card instead of inline list items

## Impact

- **Code**: New `src/components/FriendCard/index.js`, new `src/components/PendingFriendsCard/index.js`, modified `src/screens/FriendsList/index.js`
- **UX**: Friends list transforms from text list to visual card grid matching waves list
- **Dependencies**: Reuses `WavePhotoStrip`, `ShareOptionsModal`, `ActionMenu`
- **Sequencing**: Phase 2 of 4. Depends on Phase 1 (friend photo feed screen). Phase 4 (remove chat) cleans up remaining chat references
