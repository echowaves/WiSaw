## Why

The `setContactName` function in `FriendDetail/index.js` expects a plain string argument, but `NamePicker` always calls it with an object `{ friendshipUuid, contactName }`. This causes `addFriendshipLocally` to throw "contactName must be a non-empty string" because it receives an object instead of a string. The `FriendsList` screen handles this correctly by destructuring the object — `FriendDetail` needs the same fix.

## What Changes

- Fix the `setContactName` function signature in `src/screens/FriendDetail/index.js` to destructure the object `{ contactName }` from `NamePicker`, matching the pattern used in `FriendsList`

## Capabilities

### New Capabilities

_(none — bug fix)_

### Modified Capabilities

_(none — no spec-level behavior changes)_

## Impact

- **Code**: `src/screens/FriendDetail/index.js` — one function signature change
- **Risk**: Minimal — aligning with the existing working pattern in FriendsList
