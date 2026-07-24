# Design: Friends Sort by Activity

## Context

The friends list in `src/screens/FriendsList/index.js` currently sorts confirmed friends by `createdAt` (friendship creation date). The GraphQL query in `friends_helper.js` fetches up to 5 photos per friendship but only requests `id` and `thumbUrl` — not `updatedAt`. The Photo type in the GraphQL schema already exposes `updatedAt: AWSDateTime!`.

The sort picker and Jotai atoms (`friendsSortBy`, `friendsSortDirection`) were removed in a previous change (`2026-07-02-remove-sort-selector-waves-friends`). The current code has a fixed sort: `createdAt` descending. The `friends-sort` spec still references a sort picker and atoms that no longer exist — this change will also correct that drift.

## Goals / Non-Goals

**Goals:**
- Friends with recent photo uploads appear at the top of the list
- Sort uses the most recent photo's `updatedAt` per friend as the primary key
- Friends with no photos fall back gracefully to `createdAt`
- No backend changes required

**Non-Goals:**
- Re-adding a sort picker or sort state atoms
- Changing how pending friends are displayed (they remain in their own section at the top)
- Caching or performance optimization of the sort

## Decisions

### Decision 1: Request `updatedAt` in the photos sub-query

Add `updatedAt` to the GraphQL query for `getFriendshipsList`. The backend already returns photos sorted by most recently updated, so `photos[0].updatedAt` gives the latest activity timestamp without additional backend work.

**Alternative considered:** Add a dedicated `latestPhotoUpdatedAt` field to the Friendship type on the backend. Rejected because it requires a backend deployment and the same data is available via the existing `photos` array.

### Decision 2: Sort by latest photo `updatedAt` with `createdAt` fallback

```
Primary key:  photos[0].updatedAt if photos exist and photos[0].updatedAt exists
Fallback:     friendship.createdAt if no photos or no updatedAt
```

This ensures friends with no photos still appear in a reasonable order (newest friendship first) rather than being pushed to the bottom or top arbitrarily.

### Decision 3: Inline sort in the `useMemo` in FriendsList

The sort logic lives in a `useMemo` in `index.js`. No need to extract to a separate hook — the logic is a single comparison function with a fallback.

## Risks / Trade-offs

- [Slight increase in query payload] → The `updatedAt` field adds ~25 bytes per photo × 5 photos × N friends. Negligible for typical friend counts (<100).
- [Friends with no photos sort by age, not activity] → This is intentional fallback behavior. A friend with no photos has no activity signal, so `createdAt` is the next-best signal.
