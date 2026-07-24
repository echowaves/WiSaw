# Proposal: Friends Sort by Activity

## Why

The friends list currently sorts by friendship creation date (`createdAt`), so the most recently *added* friend appears at the top regardless of whether they've shared any photos. Users want to see active friends — those who recently uploaded photos — at the top so they can quickly find new content.

## What Changes

- Add `updatedAt` to the `photos` sub-query in `getFriendshipsList` (GraphQL)
- Update the sort logic in `FriendsList` to use each friend's most recent photo `updatedAt` as the primary sort key
- Friends with no photos fall back to `createdAt` (friendship age)
- Update the `friends-sort` spec to reflect the new default sort behavior (the spec currently references a sort picker and atoms that were removed in a previous change — this delta spec will correct that too)

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `friends-sort`: Change default (and only) sort from `createdAt` desc to latest photo `updatedAt` desc; correct spec to match current code (no sort picker, no atoms)

## Impact

- **Files**: `src/screens/FriendsList/friends_helper.js` (add `updatedAt` to query), `src/screens/FriendsList/index.js` (update sort comparator)
- **Specs**: `openspec/specs/friends-sort/spec.md` (delta to update default sort and remove stale sort picker/atom references)
- **No backend changes**: `updatedAt` already exists on the Photo type in the GraphQL schema
