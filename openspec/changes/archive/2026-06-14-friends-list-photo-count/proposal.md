## Why

The friends list currently displays friend names without indicating how many photos have been shared with each friend. This makes it difficult for users to quickly assess which friendships have the most shared content. The backend already exposes a `photosCount` field on the `Friendship` type (consistent with the `photosCount` field on the `Wave` type), but the client is not consuming it.

## What Changes

- Add `photosCount` field to the `getFriendshipsList` GraphQL query
- Update `FriendCard` component to display photo count next to friend name (identical to `WaveCard` implementation)
- Remove reliance on `friend.photos.length` for counting (inaccurate due to truncated photo arrays)

## Capabilities

### Modified Capabilities
- `friend-card`: Display photo count next to friend name in the friends list

## Impact

- **Files modified:** `src/screens/FriendsList/friends_helper.js`, `src/components/FriendCard/index.js`
- **GraphQL queries:** `getFriendshipsList` gains `photosCount` field
- **No new dependencies** required
- **Behavior:** Users see photo count on each friend card (e.g., "18 photos")
