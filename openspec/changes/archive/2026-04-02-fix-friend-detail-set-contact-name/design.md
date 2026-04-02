## Context

`NamePicker` calls `setContactName({ friendshipUuid, contactName })` uniformly. `FriendsList` destructures this correctly. `FriendDetail` treats the argument as a plain string, passing the entire object as `contactName` to `addFriendshipLocally`, which throws on validation.

## Goals / Non-Goals

**Goals:**
- Fix function signature to destructure `{ contactName }` from the NamePicker callback

**Non-Goals:**
- No changes to NamePicker or FriendsList

## Decisions

**Destructure `{ contactName }` in FriendDetail's `setContactName`**: The `friendshipUuid` from the object can be ignored since FriendDetail already has it from route params.

## Risks / Trade-offs

- **[Low risk]** Single-line signature change — no behavioral change beyond fixing the crash
