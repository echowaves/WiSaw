## Context

The `enabled` flag in grouping settings controls the WavesHub auto-trigger but not upload-time wave assignment. Two mechanisms in `processCompleteUpload()` assign photos to waves unconditionally: batch flushing via `flushUngroupedPhotos()` and per-photo drift check via `checkAndAssignWave()`.

## Goals / Non-Goals

**Goals:**
- When grouping is disabled, uploaded photos remain completely ungrouped (no waveUuid)
- Photos accumulate in UngroupedPhotosCard for manual grouping later

**Non-Goals:**
- No changes to server-side auto-grouping behavior
- No migration of existing grouped photos back to ungrouped state

## Decisions

1. **Read `_groupingState.enabled` directly from the internal atom state object** rather than re-reading from AsyncStorage at flush time. Rationale: `setGroupingEnabled()` updates both storage and `_groupingState` synchronously, so by the time an upload completes later in the same event loop, the flag is already current. This avoids adding a new async read path.

2. **Gate both mechanisms independently** rather than wrapping them in a single "is grouping enabled" check at `processCompleteUpload()` level. Rationale: keeps each guard localized to its own function, making future changes easier to reason about.

## Risks / Trade-offs

- `_groupingState` is an internal variable — if something else modifies it without going through the setter functions, it could drift out of sync with storage. Low risk given current codebase structure.
- No design complexity here; this is a targeted fix rather than architectural change.
