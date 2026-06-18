## Why

Clicking on a photo in the photo strip of a friend card (in the Friends list) navigates to the friend's photo feed screen (`FriendDetail`), but the screen shows an empty list with "No Photos Yet" instead of displaying the friend's photos.

## Root Cause Analysis

The current navigation implementation in `src/screens/FriendsList/index.js`:

```javascript
const handleFriendPress = useCallback((friend) => {
  const friendUserUuid = friend.uuid1 === uuid ? friend.uuid2 : friend.uuid1
  router.push({
    pathname: `/friendships/${friendUserUuid}`,
    params: {
      friendName: friend?.contact || 'Unnamed Friend',
      friendshipUuid: friend.friendshipUuid
    }
  })
}, [uuid])
```

**Expected behavior:** 
- Route file: `/app/friendships/[friendUuid].tsx`
- Navigation: `/friendships/${friendUserUuid}` → `friendUuid` extracted from URL path
- `useLocalSearchParams()` should return: `{friendUuid: friendUserUuid, friendshipUuid: '...', friendName: '...'}`

**Actual behavior:** 
- The `FriendDetail` screen shows "No Photos Yet" instead of the friend's photos
- Possible causes (to be investigated):
  1. `friendUuid` not being correctly extracted from URL path
  2. `friendUuid` being `undefined` when `fetchFriendPhotos` is called
  3. Route matching issue with Expo Router

**Investigation findings:**
- The route file exists: `/app/friendships/[friendUuid].tsx` ✓
- Navigation uses: `/friendships/${friendUserUuid}` ✓
- `friendUserUuid` correctly computed as the friend's user UUID (not `friendshipUuid`) ✓
- The code pattern matches the archived fix `2026-04-01-fix-friend-uuid-mismatch` which was supposed to address this ✓

**Hypothesis:** The navigation is correct, but there may be a caching, state, or route matching issue preventing the photos from loading. The fix should ensure `friendUuid` is properly passed and accessible in `FriendDetail`.

## What Changes

- Update `FriendsList.handleFriendPress` to explicitly pass `friendUuid` in params (in addition to URL path)
- This ensures `FriendDetail` receives `friendUuid` regardless of how `useLocalSearchParams()` extracts it
- This makes the data flow more explicit and robust

## Capabilities

### Modified Capabilities
- `friend-photo-feed`: Photo strip click now correctly navigates to friend's photo feed with photos loaded

## Investigation: Waves List Navigation

### Findings

After investigating the waves list navigation, I found that the **waves list does NOT have the same bug**. The navigation implementation is correct:

**Waves navigation flow:**
```javascript
// src/screens/WavesHub/index.js
const handleWavePress = useCallback((wave) => {
  router.push({
    pathname: `/waves/${wave.waveUuid}`,
    params: {
      waveName: wave.name,
      myRole: wave.myRole,
      isFrozen: wave.isFrozen
    }
  })
}, [])
```

**Route file:** `/app/(drawer)/waves/[waveUuid].tsx`

**WaveDetail expects:**
```javascript
const { waveUuid, waveName, myRole, isFrozen } = useLocalSearchParams()
```

**Why waves was CORRECTED:**
- URL path: `/waves/${wave.waveUuid}` → `waveUuid` extracted from path ✓
- BUT params did NOT include `waveUuid` - only `waveName`, `myRole`, `isFrozen` ✗
- `useLocalSearchParams()` returns: `{waveName: '...', myRole: '...', isFrozen: '...'}` - `waveUuid` missing! ✗
- Route file parameter `[waveUuid].tsx` expects `waveUuid` but it's not in params ✗

**Fix applied:** Added `waveUuid: wave.waveUuid` to params in `WavesHub.handleWavePress`

**Conclusion:** Both waves and friends had the same root cause - missing UUID in navigation params. The fix ensures UUID is passed in both URL path AND params for robustness.

## Impact

- **Files modified (frontend):** 
  - `src/screens/WavesHub/index.js` - Added `waveUuid` to params
  - `src/screens/FriendsList/index.js` - Added `friendUuid` to params
- **Files modified (backend):**
  - `Wisaw.cdk/lambda-fns/controllers/friendships/feedForFriend.ts` - Fixed SQL query to JOIN with Watchers table
- **GraphQL queries:** No changes (queries already correct)
- **No new dependencies** required
- **Behavior:** Clicking a photo in a friend card or wave card now shows the photos instead of empty state

## Backend Fix Required (CRITICAL)

The frontend fix alone is **NOT SUFFICIENT**. The backend `feedForFriend` resolver has a SQL query bug:

**Buggy query in `Wisaw.cdk/lambda-fns/controllers/friendships/feedForFriend.ts`:**
```typescript
const query = `
  SELECT p.*
  FROM "Photos" p
  WHERE
    p."uuid" = $1  -- BUG: Looking for photo where photo.uuid = friend's user uuid
  AND p.active = true
`
```

**Problem:** This looks for photos where `photo.uuid = friendUuid`, which is wrong because photos have their own UUIDs, not the friend's UUID.

**Fixed query:**
```typescript
const query = `
  SELECT p.*
  FROM "Photos" p
  INNER JOIN "Watchers" w
    ON p.id = w."photoId"
  WHERE
    w.uuid = $1  -- CORRECT: Find photos where friend is a watcher
  AND p.active = true
`
```

**Why:** Photos are shared with users via the `Watchers` table. A photo is "shared" with a user when there's a row in `Watchers` linking `photo.id -> user.uuid`.

**Impact:** Without this backend fix, the frontend navigation will work but `feedForFriend` will always return an empty photos array, showing "No Photos Yet" even when friends have shared photos.

**Action required:** Apply the backend fix in `Wisaw.cdk/lambda-fns/controllers/friendships/feedForFriend.ts` before testing.

---

## Additional Issue: Missing Initial Load Trigger

Even after applying the backend fix, we discovered that both `FriendDetail` and `WaveDetail` screens were NOT triggering initial photo loads on mount.

**Problem:** The `useFeedLoader` hook provides a `reload()` function but does NOT auto-load on mount. The screens must explicitly call `reload()` on initial render.

**Evidence:** 
- User reported: "friends photos list lands on screen with no photos, but when pull to refresh -- showing the right photos"
- Pull-to-refresh works because `onRefresh` handler calls `reload()`
- Initial mount does NOT call `reload()` - no `useEffect` or similar trigger exists

**Fix Applied:**
Added `useEffect` to both `FriendDetail` and `WaveDetail` to call `reload()` on mount:

```javascript
// Trigger initial reload on mount
useEffect(() => {
  console.log('FriendDetail useEffect: triggering initial reload')
  reload()
}, [reload])
```

**Files modified:**
- `src/screens/FriendDetail/index.js` - Added `useEffect` to trigger initial reload
- `src/screens/WaveDetail/index.js` - Added `useEffect` to trigger initial reload

**Why:** The `PhotosListMasonry` component has `onEndReached` for pagination, but on initial render with an empty list, the user can't scroll, so `onEndReached` never fires. The `reload()` must be called explicitly on mount.
