## Why

The backend already exposes `feedForFriend` (returning the same `PhotoFeed` type as `feedForWave`), but the app has no screen to display a friend's photos. This is the foundation for redesigning the friends experience — tapping a friend should show their shared photos, not open a chat. This change builds the photo feed screen and its data layer first, so the friends list redesign (Phase 2) has a destination to navigate to.

## What Changes

- Add `fetchFriendPhotos` reducer function calling the `feedForFriend` GraphQL query
- Create a new `FriendDetail` screen using `PhotosListMasonry` (same masonry grid used by `WaveDetail`), view-only (no camera footer)
- Add Expo Router route at `app/friendships/[friendUuid].tsx` with the friend's name in the header
- Wire kebab menu in the header for friend-specific actions (edit name, remove friend)

## Capabilities

### New Capabilities

- `friend-photo-feed`: Fetching and displaying a paginated photo feed for a specific friend using `feedForFriend` and `PhotosListMasonry`

### Modified Capabilities

_None._

## Impact

- **Code**: New `src/screens/FriendDetail/` (index.js, reducer.js), new route `app/friendships/[friendUuid].tsx`
- **API**: Calls existing `feedForFriend` GraphQL query (already in backend)
- **Dependencies**: Reuses `PhotosListMasonry`, `usePhotoExpansion`, `AppHeader` — no new dependencies
- **Sequencing**: Phase 1 of 4. Phase 2 (friends list redesign) depends on this screen existing
