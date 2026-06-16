## Context

The WavesHub screen subscribes to two events: `autoGroupDone` and `uploadComplete`. After a June 2026 revert, both listeners call `fetchCounts()` which only updates badge numbers — the waves list never refreshes, so newly grouped photos don't appear.

The `runAutoGroup()` function already updates `ungroupedPhotosCount` via `setUngroupedPhotosCount(result.photosRemaining)` before emitting `autoGroupDone`. The `handleRefresh()` function (pull-to-refresh) already resets pagination and calls `loadWaves()` which returns wave counts in the GraphQL response.

## Goals / Non-Goals

**Goals:**
- Waves list refreshes after auto-group completes, showing newly grouped photos
- Upload completion only updates the ungrouped count badge (lightweight)
- Minimize code changes, remove unused imports and functions

**Non-Goals:**
- Not introducing new event types or state atoms
- Not modifying `UngroupedPhotosCard` or `WaveHeaderIcon` behavior

## Decisions

### 1. Auto-group done → `handleRefresh()` instead of manual pagination reset
`handleRefresh()` already has a coalescing guard (`refreshRunningRef`) to prevent concurrent refreshes. Calling it on auto-group completion reuses existing logic rather than duplicating pagination reset + `loadWaves()` calls. The `runAutoGroup()` function already sets `ungroupedPhotosCount`, so badges stay correct.

**Alternatives considered:**
- Manual pagination reset + `loadWaves()` — rejected, duplicates `handleRefresh()` logic and was the previous reverted approach
- Call `fetchCounts()` + `handleRefresh()` — rejected, redundant since `runAutoGroup()` already updates counts

### 2. Upload complete → `getUngroupedPhotosCount()` only
Uploads add ungrouped photos. The badge needs updating, but the waves list doesn't need a full reload since no waves changed. Single lightweight GraphQL call vs two calls in `fetchCounts()`.

### 3. Remove `fetchCounts()`, `getWavesCount` import, `setWavesCount`, and `useSetAtom`
These were only used by the event listeners. Removing them reduces dead code and unused imports.

## Risks / Trade-offs

- **[handleRefresh() shows spinner briefly]** → Acceptable; the refresh guard prevents concurrent executions. User sees the same spinner they'd see on pull-to-refresh.
- **[Upload doesn't refresh waves list]** → Intentional; uploads only add ungrouped photos, which don't appear in the waves list until grouped.
