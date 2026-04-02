## Context

`FriendCard` already has a kebab button (bottom-right of the info row) using `Ionicons 'ellipsis-vertical'` that calls `onLongPress(friend)`. `PendingFriendsCard` rows support long-press but have no visible menu trigger. The Share button stays top-right inline with the friend name.

## Goals / Non-Goals

**Goals:**
- Add kebab button to bottom-right of each pending friend row, mirroring the FriendCard pattern

**Non-Goals:**
- No changes to ActionMenu items or the Share button placement

## Decisions

**Mirror FriendCard kebab pattern**: Use the same `Ionicons 'ellipsis-vertical'` with `onLongPress(friend)` callback, positioned at the bottom-right of the row.

## Risks / Trade-offs

- **[Low risk]** Single-component change with existing callback wiring
