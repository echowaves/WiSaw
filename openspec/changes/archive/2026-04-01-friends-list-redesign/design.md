## Context

The current `FriendsList` screen (~700 lines) renders a `FlatList` of text-only friend items. Confirmed friends show name + unread count and navigate to chat. Pending friends appear inline at the top and are non-tappable. The waves list uses `WaveCard` (photo strip + info row) and `UngroupedPhotosCard` (dashed header card) — both patterns serve as templates for the friends redesign.

The `Friendship` type from the backend already includes `photos: [Photo]`, providing initial thumbnails for the card's photo strip. Additional photos load via `fetchFriendPhotos` (from Phase 1).

## Goals / Non-Goals

**Goals:**
- Create `FriendCard` mirroring `WaveCard` — photo strip + friend name + menu button
- Create `PendingFriendsCard` mirroring `UngroupedPhotosCard` — dashed card grouping pending friends with remind/explain content
- Rewire friend tap to navigate to friend photo feed (`/friendships/[friendUuid]`)
- Remove chat-related UI from the friends list (unread counts, chat navigation)

**Non-Goals:**
- Deleting chat code (Phase 4)
- Adding sort options to the photo feed (Phase 3)
- Changing friend context menu actions (they stay: edit name, remove friend, share)

## Decisions

### Decision 1: FriendCard as a new component, not generalizing WaveCard

**Choice**: Create `src/components/FriendCard/index.js` as a standalone component following `WaveCard`'s structure.

**Rationale**: `WaveCard` is 88 lines and tightly coupled to wave-specific props (`wave.name`, `wave.photosCount`, `wave.waveUuid`). A generic `CollectionCard` abstraction would add indirection for minimal code savings. Two small, focused components are clearer than one abstracted one.

### Decision 2: PendingFriendsCard as ListHeaderComponent

**Choice**: Render `PendingFriendsCard` as the `ListHeaderComponent` of the friends `FlatList`, just as `UngroupedPhotosCard` is the header of the waves list.

**Rationale**: Pending friends should visually stand out at the top, grouped in a card. This matches the ungrouped-photos pattern. The card only renders when pending friends exist.

### Decision 3: Remind button uses existing ShareOptionsModal

**Choice**: The "Remind" action on each pending friend opens `ShareOptionsModal` with that friendship's UUID — same flow as the existing "Share Link" context menu action.

**Rationale**: Zero new infrastructure needed. Re-sharing the invitation link IS the reminder.

### Decision 4: FriendCard photo strip uses Friendship.photos + fetchFriendPhotos

**Choice**: `FriendCard` passes `friendship.photos` as `initialPhotos` to `WavePhotoStrip` and provides a `fetchFn` that calls `fetchFriendPhotos` for lazy-loading more thumbnails.

**Rationale**: Mirrors exactly how `WaveCard` uses `wave.photos` + `fetchWavePhotos`. The backend already returns photos in the friendship list response.

## Risks / Trade-offs

- [Friendship.photos may not be populated by backend] → Need to verify the `getFriendshipsList` query returns `photos` field. If not, the photo strip shows placeholders until the user scrolls and triggers a fetch.
- [Performance with many friends] → Same as waves list. `FlatList` virtualization handles this.
