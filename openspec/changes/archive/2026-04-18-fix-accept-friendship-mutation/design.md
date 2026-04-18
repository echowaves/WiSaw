## Context

The `confirmFriendship()` function in `src/screens/FriendsList/friends_helper.js` sends an `acceptFriendshipRequest` GraphQL mutation to the AppSync backend. The mutation's selection set includes a `friendship` wrapper field that does not exist on the `Friendship` return type, causing AppSync to reject the query at validation time before it reaches the resolver. The backend schema returns `Friendship!` directly — no wrapper object.

The working `createFriendship` mutation in `src/screens/FriendsList/reducer.js` correctly uses a flat selection set against the same `Friendship` type and works as expected.

## Goals / Non-Goals

**Goals:**
- Align the `acceptFriendshipRequest` mutation selection set with the backend schema
- Fix the result destructuring to correctly read the mutation response
- Restore friendship acceptance functionality

**Non-Goals:**
- No backend schema changes
- No changes to the friendship creation flow (already working)
- No changes to deep link routing or the ConfirmFriendship screen UI

## Decisions

### Remove `friendship` wrapper from selection set

The mutation selection set will directly request fields on the `Friendship` type without a wrapper, matching how `createFriendship` already works:

```graphql
acceptFriendshipRequest(friendshipUuid: $friendshipUuid, uuid: $uuid) {
    createdAt
    friendshipUuid
    uuid1
    uuid2
}
```

**Rationale**: The backend's `acceptFriendshipRequest` resolver returns `Friendship!` directly. The extra `friendship` wrapper was likely a copy-paste error from a different API pattern.

### Read result directly from `result.data.acceptFriendshipRequest`

The destructuring changes from:
```js
const { friendship } = result.data.acceptFriendshipRequest
```
to:
```js
const friendship = result.data.acceptFriendshipRequest
```

**Rationale**: Without the wrapper field, the response object IS the friendship — no destructuring needed.

## Risks / Trade-offs

- **[Low risk]** Change is minimal (two lines) and mirrors the proven `createFriendship` pattern → Low regression risk.
- **[Verify]** The return value `{ friendship }` from `confirmFriendship()` is consumed by `ConfirmFriendship.js` — the shape remains `{ friendship: { ... } }` so callers are unaffected.
