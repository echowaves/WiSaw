## Why

The `acceptFriendshipRequest` GraphQL mutation fails with a validation error ("Validation error of type FieldUndefined") because the client's mutation selection set includes a non-existent `friendship` wrapper field. This prevents all users from accepting friendship invitations — a core feature of the app.

## What Changes

- Fix the `acceptFriendshipRequest` mutation selection set in `confirmFriendship()` to match the backend schema (remove the `friendship` wrapper field)
- Fix the result destructuring to read the response correctly from `result.data.acceptFriendshipRequest` directly

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `friendships`: Fix the GraphQL mutation selection set for accepting friendship requests to match the backend schema's `Friendship!` return type

## Impact

- `src/screens/FriendsList/friends_helper.js` — `confirmFriendship()` function: mutation query and result destructuring
- No API changes (backend is correct, client is wrong)
- No dependency changes
- All friendship acceptance flows are affected: deep link acceptance, QR code acceptance
