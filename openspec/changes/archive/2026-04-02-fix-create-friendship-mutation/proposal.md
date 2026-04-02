## Why

The `createFriendship` GraphQL mutation in the client requests a nested `friendship` sub-field on the `Friendship` return type, but the backend schema returns `Friendship` fields directly. This was caused by the chat feature removal (commit `898a947c`) which stripped chat-related fields (`chat`, `chatUser`, `chatUuid`) from the mutation but left the `friendship { ... }` wrapper intact. The server no longer returns a wrapper object — it returns `Friendship` directly — so the mutation always fails with `FieldUndefined: Field 'friendship' in type 'Friendship' is undefined`.

## What Changes

- Fix the `createFriendship` GraphQL mutation query in `src/screens/FriendsList/reducer.js` to remove the invalid nested `friendship` wrapper and query `Friendship` fields directly
- Fix the result destructuring to match the flat response shape (`const friendship = ...` instead of `const { friendship } = ...`)

## Capabilities

### New Capabilities

_(none — this is a bug fix)_

### Modified Capabilities

_(none — no spec-level behavior changes, only fixing a broken query to match the existing backend schema)_

## Impact

- **Code**: `src/screens/FriendsList/reducer.js` — the `createFriendship` function (mutation query and response handling)
- **APIs**: No backend changes needed; the client query is being corrected to match the existing server schema
- **Risk**: Low — straightforward fix aligning client query with server schema that was previously working before chat removal
