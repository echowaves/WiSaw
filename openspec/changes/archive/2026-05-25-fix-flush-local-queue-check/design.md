## Context

`flushUngroupedPhotos` was originally called inside `processCompleteUpload` before `removeFromQueue`, so the local queue still had the current item. The function checked the local queue as a cheap pre-filter before hitting the server. After the timing fix moved the flush to post-drain (5s after all uploads complete), the local queue is always empty when flush runs, making the guard always short-circuit.

## Goals / Non-Goals

**Goals:**
- `flushUngroupedPhotos` calls the server's `autoGroupPhotos` mutation when invoked with grouping enabled

**Non-Goals:**
- Changing the auto-group loop logic or the 5s delay
- Adding new server-side checks for ungrouped photos

## Decisions

### Remove local queue check from `flushUngroupedPhotos`
**Decision**: Delete the `readQueue()` / `hasUngrouped` guard. The function should proceed directly to calling `autoGroupPhotos` after the UUID and grouping-enabled checks.
**Rationale**: The server-side `autoGroupPhotos` already handles the "no ungrouped photos" case gracefully (returns `photosGrouped: 0, hasMore: false`). The local queue check was an optimization that no longer applies — it checked for items that had already been removed. One extra server call when there are zero ungrouped photos is negligible.
**Alternative**: Re-add items to the queue before flushing — rejected as unnecessarily complex and conceptually wrong (the queue tracks upload work, not grouping work).

## Risks / Trade-offs

- **[Extra server call when no ungrouped photos exist]** → Negligible cost. The server returns immediately with `photosGrouped: 0, hasMore: false`. Happens at most once per upload batch.
