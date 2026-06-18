## Context

When clicking on a photo in the photo strip of either a **friend card** (in Friends list) or a **wave card** (in Waves list), the app navigates to the respective photo feed screen but shows an empty "No Photos Yet" list instead of the actual photos.

## Root Cause

Both `FriendsList.handleFriendPress` and `WavesHub.handleWavePress` were NOT explicitly passing the UUID parameter (`friendUuid` or `waveUuid`) in the navigation params object, relying only on URL path extraction by Expo Router.

While `useLocalSearchParams()` is supposed to extract path parameters, explicitly passing the UUID in params ensures robustness and makes the data flow more explicit.

## Goals / Non-Goals

**Goals:**
- Fix photo strip click to correctly navigate to friend's photo feed with photos loaded
- Fix photo strip click to correctly navigate to wave's photo feed with photos loaded
- Ensure `friendUuid` and `waveUuid` are passed to their respective detail screens
- Restore ability to view all photos shared with a friend or in a wave

**Non-Goals:**
- Changing the navigation URL structure
- Modifying the GraphQL schema (queries already correct)
- Adding new dependencies or components

## Decisions

### 1. Add `friendUuid` to FriendsList Navigation Params

**Implementation**:
```javascript
const handleFriendPress = useCallback((friend) => {
  const friendUserUuid = friend.uuid1 === uuid ? friend.uuid2 : friend.uuid1
  router.push({
    pathname: `/friendships/${friendUserUuid}`,
    params: {
      friendUuid: friendUserUuid,  // ← ADDED THIS
      friendName: friend?.contact || 'Unnamed Friend',
      friendshipUuid: friend.friendshipUuid
    }
  })
}, [uuid])
```

**Rationale**: Explicitly passing `friendUuid` in params ensures it's available to `FriendDetail` via `useLocalSearchParams()`, even if path parameter extraction fails.

### 2. Add `waveUuid` to WavesHub Navigation Params

**Implementation**:
```javascript
const handleWavePress = (wave) => {
  router.push({
    pathname: `/waves/${wave.waveUuid}`,
    params: {
      waveUuid: wave.waveUuid,  // ← ADDED THIS
      waveName: wave.name,
      myRole: wave.myRole || '',
      isFrozen: wave.isFrozen ? '1' : '0'
    }
  })
}
```

**Rationale**: Same as above - explicit parameter passing ensures robustness.

### 3. Keep URL Structure Unchanged
**Rationale**: The URL patterns `/friendships/${friendUserUuid}` and `/waves/${wave.waveUuid}` are fine. The issue is only in the params, not the routing pattern.

## Implementation Tasks

### Task 1: Add `waveUuid` to WavesHub Navigation Params

- [x] 1.1 In `src/screens/WavesHub/index.js`, add `waveUuid: wave.waveUuid` to the params object in `handleWavePress` function

### Task 2: Add `friendUuid` to FriendsList Navigation Params

- [x] 2.1 In `src/screens/FriendsList/index.js`, add `friendUuid: friendUserUuid` to the params object in `handleFriendPress` function

### Task 3: Testing

- [ ] 3.1 Test: Click on a photo in a friend card's photo strip
- [ ] 3.2 Verify: FriendDetail screen loads and shows photos from that friend
- [ ] 3.3 Test: Click on a photo in a wave card's photo strip
- [ ] 3.4 Verify: WaveDetail screen loads and shows photos from that wave
- [ ] 3.5 Test: Click on a friend card (not photo strip) to verify info area navigation still works
- [ ] 3.6 Test: Friend with no photos shows correct empty state with "No Photos Yet"
**File:** `src/screens/FriendsList/index.js`
**Function:** `handleFriendPress` (line ~408-416)

**Change:** Add `friendUuid: friendUserUuid` to the params object

```diff
  const handleFriendPress = useCallback((friend) => {
    const friendUserUuid = friend.uuid1 === uuid ? friend.uuid2 : friend.uuid1
    router.push({
      pathname: `/friendships/${friendUserUuid}`,
      params: {
+       friendUuid: friendUserUuid,
        friendName: friend?.contact || 'Unnamed Friend',
        friendshipUuid: friend.friendshipUuid
      }
    })
  }, [uuid])
```

## Risks / Trade-offs

- [Navigation param mismatch] → The `FriendDetail` screen already expects `friendUuid` in params, so this change aligns with existing expectations rather than changing them. Low risk.
