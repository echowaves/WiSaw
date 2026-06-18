# Backend Fix Prompt for Wisaw.cdk

## Issue: feedForFriend Returns Empty Photos

**Problem:** When users click on photos in friend card photo strips, the friend detail screen shows "No Photos Yet" even when friends have shared photos.

**Root Cause:** The `feedForFriend` resolver in `Wisaw.cdk/lambda-fns/controllers/friendships/feedForFriend.ts` has a SQL query bug.

## Fix Required

**File:** `Wisaw.cdk/lambda-fns/controllers/friendships/feedForFriend.ts`

**Current (BROKEN) Code:**
```typescript
const query = `
  SELECT p.*
  FROM "Photos" p
  WHERE
    p."uuid" = $1  -- BUG: Looking for photo where photo.uuid = friend's user uuid
  AND p.active = true
  ${searchClause}
  ORDER BY p.${sortField} ${direction}
  LIMIT $2
  OFFSET $3
`
```

**Fix - Replace with:**
```typescript
const query = `
  SELECT p.*
  FROM "Photos" p
  INNER JOIN "Watchers" w
    ON p.id = w."photoId"
  WHERE
    w.uuid = $1  -- CORRECT: Find photos where friend is a watcher
  AND p.active = true
  ${searchClause}
  ORDER BY p.${sortField} ${direction}
  LIMIT $2
  OFFSET $3
`
```

## Why This Fix Works

- **Current behavior:** The query looks for photos where `photo.uuid = friendUuid`, which is wrong because photos have their own UUIDs, not the friend's UUID
- **Correct behavior:** The query should find photos where the friend is a "watcher" (i.e., photos shared with the friend via the `Watchers` table)
- **Pattern:** This matches the existing `feedForWatcher` resolver which correctly uses the same JOIN pattern

## Database Schema Context

```
Photos table:
  - id (PK)
  - uuid (photo's unique ID)
  - watchersCount
  - ...

Watchers table:
  - id (PK)
  - photoId (FK to Photos.id)
  - uuid (user who is watching/has access to photo)
```

A photo is "shared" with a user when there's a row in `Watchers` linking `photo.id -> user.uuid`.

## Testing

After applying the fix:

1. Deploy to test environment
2. Find a friend who has shared photos
3. Click on a photo in their friend card
4. Expected: Friend detail screen shows their photos (not "No Photos Yet")
5. Expected: Can scroll and load more photos

## Related Frontend Fix

Frontend has already been fixed to pass `friendUuid` in navigation params:
- `WiSaw/src/screens/FriendsList/index.js:416` - Added `friendUuid: friendUserUuid` to params
- `WiSaw/src/screens/FriendDetail/index.js:36` - Receives `friendUuid` via `useLocalSearchParams()`

But the backend fix is the **critical missing piece** that prevents any photos from being returned.
