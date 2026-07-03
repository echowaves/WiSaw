## Context

### Current State

Photo thumbs in feeds display comment metadata (`commentsCount`, `watchersCount`, `lastComment`) fetched from the backend. These values are cached in the `photosList` state managed by `useFeedLoader` hook.

When a user adds or removes a comment:
1. Backend mutation succeeds
2. `getPhotoDetails()` refreshes the Photo Details screen state
3. `emitPhotoRefresh()` notifies other Photo component instances
4. **BUT** `photosList` is never updated

Users see stale comment data until they pull-to-refresh or navigate away and back.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Photo Component                         │
│  • submitComment() / deleteComment()                        │
│  • emitPhotoRefresh()                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ emits
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   photoRefreshBus                           │
│  • Notifies Photo instances (same photo only)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ but does NOT update
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  useFeedLoaderphotosList                     │
│  • Main feed, Wave Detail, Friend Detail, Bookmarks         │
│  • No subscription for comment updates                      │
└─────────────────────────────────────────────────────────────┘
```

### Constraints

- Backend API cannot be changed (no server-side push for comment updates)
- `photosList` items are frozen (immutable) for masonry layout compatibility
- Must work across multiple screens (feed, wave detail, friend detail, bookmarks)
- Must not trigger unnecessary re-renders or duplicate network calls

## Goals / Non-Goals

**Goals:**
1. Photo thumbs update immediately when comments are added or removed
2. Comment count, watcher count, and last comment text all update
3. Works in all feed contexts (main, wave detail, friend detail, bookmarks)
4. No manual refresh required
5. Follow existing patterns in the codebase (similar to `photoDeletionBus`)

**Non-Goals:**
1. Real-time WebSocket subscriptions for comment changes (overkill for this change)
2. Optimistic UI updates (server authoritative)
3. Batch multiple comment updates (each comment is independent)
4. Updating comment data in Photo Details screen (already working)

## Decisions

### Decision 1: Create new event bus `photoCommentBus`

**Why:** Similar to existing `photoDeletionBus`, this provides a clean decoupling mechanism. The feed doesn't need to know about comment logic; it just listens for updates.

**Alternatives considered:**
- *Option A: Pass `setPhotosList` down through component tree* - Too coupled, harder to test
- *Option B: Use existing `photoRefreshBus`* - This bus triggers full `getPhotoDetails()` fetch, which is unnecessary for simple thumb updates
- *Option C: Direct state update in reducer* - Would require passing `setPhotosList` everywhere

**Trade-off:** Slight increase in event bus complexity, but clean separation of concerns.

### Decision 2: Emit event after backend mutation succeeds

**Why:** Server authoritative approach. We only update UI after backend confirms the change.

**Trade-off:** Not real-time optimistic, but simpler and avoids rollback complexity.

### Decision 3: Update photo object in `photosList` by replacing entire object

**Why:** `photosList` items are frozen. We must return a new object to maintain immutability.

**Implementation:**
```javascript
setPhotosList((currentList) =>
  currentList.map((p) =>
    p.id === photoId ? { ...p, _needsRefresh: true } : p
  )
)
```

### Decision 4: Trigger full `getPhotoDetails()` fetch on comment update

**Why:** Ensures all comment-related fields are fresh (`commentsCount`, `lastComment`, `watchersCount`). A simple thumb update might miss edge cases.

**Trade-off:** Extra network call, but acceptable for comment operations (infrequent). Could optimize later with delta updates.

## Risks / Trade-offs

**[Risk]** Extra network call for each comment action
→ **Mitigation:** Acceptable trade-off for UX improvement. Comment operations are infrequent compared to feed scrolling.

**[Risk]** Race condition if user adds/deletes comments rapidly
→ **Mitigation:** Each operation is independent. Backend mutations are serialized by nature of GraphQL requests.

**[Risk]** Multiple Photo instances all emitting updates
→ **Mitigation:** Only the active instance (where user interacted) emits the event. Others just listen.

**[Risk]** Memory leak if subscription not cleaned up
→ **Mitigation:** Hook already handles subscription cleanup via `useEffect` return function (pattern already used for `photoDeletionBus`).

## Migration Plan

**Deployment:**
1. Create `src/events/photoCommentBus.js` (new file)
2. Update `src/hooks/useFeedLoader.js` to subscribe to comment events
3. Update `src/components/Photo/reducer.js` to emit comment events
4. Update `src/components/Photo/index.js` if needed for inline comment submission

**Rollback:**
- Simple file revert. No database migrations or API changes.
- Old behavior (stale thumbs) restored if code reverted.

**Verification:**
1. Test comment add/remove in main feed
2. Test in Wave Detail
3. Test in Friend Detail
4. Test in Bookmarks
5. Verify pull-to-refresh still works
6. Check no console errors