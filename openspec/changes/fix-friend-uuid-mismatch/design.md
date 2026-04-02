## Context

The friends-list-redesign change introduced `FriendCard` and rewired `FriendsList` to navigate to `/friendships/[friendUuid]`. Both locations pass `friend.friendshipUuid` (a relationship identifier) where the backend `feedForFriend` GraphQL query expects the friend's **user UUID**. The friendship object already contains both user UUIDs (`uuid1` — creator, `uuid2` — acceptor) alongside `friendshipUuid`.

## Goals / Non-Goals

**Goals:**
- Pass the correct friend user UUID to `fetchFriendPhotos` and the friend detail route
- Keep `friendshipUuid` available on the detail screen for operations that need it (e.g., name editing, removal)

**Non-Goals:**
- Renaming the route file `[friendUuid].tsx` — the param name is already correct, only its value was wrong
- Backend or GraphQL schema changes — the API is correct; only the client is sending the wrong ID

## Decisions

### 1. Derive friend UUID inline at each call site

Compute `friend.uuid1 === currentUserUuid ? friend.uuid2 : friend.uuid1` directly in `FriendCard` and `handleFriendPress`. The calculation is trivial and used in only two places, so a shared helper would be over-engineering.

**Alternative considered:** Add a `friendUserUuid` field during `getEnhancedListOfFriendships`. Rejected because it adds a data-layer change for a two-line fix and modifies a function already touched in two prior changes.

### 2. Pass friendshipUuid as a query param in navigation

Change `handleFriendPress` to navigate to `/friendships/${friendUserUuid}` with `friendshipUuid` as a route param (alongside `friendName`). The detail screen already destructures both `friendUuid` (from path) and `friendshipUuid` (from params).

## Risks / Trade-offs

- [Low risk] If a friendship object somehow lacks `uuid1`/`uuid2`, the derived UUID would be `undefined`. → Mitigation: The GQL query always returns both fields; no extra guard needed.
