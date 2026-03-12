## Context

The auto-group feature calls `autoGroupPhotosIntoWaves` in a loop, creating one wave per call. The current code uses `while (true)` with an `eslint-disable` comment and breaks when `photosGrouped === 0`. The backend has updated `AutoGroupResult` to include explicit `hasMore: Boolean!` and `photosRemaining: Int!` fields, making loop control cleaner.

Current reducer selection set: `{ waveUuid, name, photosGrouped }`
New schema: `{ waveUuid: String, name: String, photosGrouped: Int!, photosRemaining: Int!, hasMore: Boolean! }`

## Goals / Non-Goals

**Goals:**
- Align the GraphQL selection set with the updated `AutoGroupResult` schema
- Use `hasMore` as the loop termination condition instead of `photosGrouped === 0`
- Remove the `eslint-disable` workaround by using a `do...while(hasMore)` loop

**Non-Goals:**
- Showing `photosRemaining` as progress in the UI (can be added later)
- Changing the confirmation dialog, button placement, or overall UX
- Adding cancellation support to the loop

## Decisions

### 1. Use `do...while(result.hasMore)` loop pattern

**Decision**: Replace `while (true) { ... if (photosGrouped === 0) break }` with `do { ... } while (result.hasMore)`.

**Rationale**: The `hasMore` boolean is an explicit signal from the backend designed for loop control. This eliminates the `eslint-disable-next-line no-constant-condition` comment and makes the loop's termination condition self-documenting. The `do...while` runs at least once which matches the current behavior — we always make at least one call.

### 2. Keep `photosRemaining` in selection set but don't use it in UI yet

**Decision**: Request `photosRemaining` from the API but don't display it in this change.

**Rationale**: Fetching it now costs nothing (it's already computed server-side). It can be used for progress UI in a future change without another schema update.

## Risks / Trade-offs

- **[Minimal risk]** → This is a small, focused change to two files. The loop behavior is functionally identical — only the termination condition changes from implicit (`photosGrouped === 0`) to explicit (`hasMore === false`).
