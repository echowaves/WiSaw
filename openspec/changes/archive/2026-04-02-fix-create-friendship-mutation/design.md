## Context

The `createFriendship` mutation in `src/screens/FriendsList/reducer.js` was broken during the chat feature removal. The backend `Friendship` type previously returned a wrapper object containing `chat`, `chatUser`, and `friendship` sub-objects. After chat removal, the backend simplified to return `Friendship` fields directly. The client mutation wasn't fully updated to match.

## Goals / Non-Goals

**Goals:**
- Restore working `createFriendship` flow by aligning the client GraphQL mutation with the backend schema

**Non-Goals:**
- No backend schema changes
- No changes to friendship business logic or UX flow
- No refactoring beyond the broken query

## Decisions

**Flatten the mutation query**: Remove the `friendship { ... }` wrapper and query the `Friendship` fields (`friendshipUuid`, `uuid1`, `uuid2`, `createdAt`) directly on the `createFriendship` return type.

- *Rationale*: The backend schema defines `createFriendship(uuid: String!): Friendship!` — the return type IS `Friendship`, not a wrapper containing a `friendship` field.

**Fix result destructuring**: Change `const { friendship } = (...).data.createFriendship` to `const friendship = (...).data.createFriendship` since the response is the `Friendship` object itself.

- *Rationale*: With the flat query, `data.createFriendship` is directly the `Friendship` object. The previous destructuring expected a nested property that no longer exists.

## Risks / Trade-offs

- **[Low risk]** Single-file change with clear before/after behavior → minimal regression surface
- **[Testing]** Requires manual verification by creating a friendship after the fix — no automated integration tests for this mutation
