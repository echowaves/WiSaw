## Context

### Background

The Waves screen (`src/screens/WavesHub/index.js`) displays waves and ungrouped photos. It uses:
- **Jotai atoms** (`ungroupedPhotosCount`, `wavesCount`, `bookmarksCount`) for badge counts
- **Event bus pattern** (`autoGroupBus`, `uploadBus`) for cross-component communication
- **Apollo GraphQL** with cache-first policy by default

### Current State (After June 15 "Simplify" Commit)

**WavesHub**:
- Removed ALL event subscriptions: `subscribeToAutoGroupDone`, `subscribeToUploadComplete`
- Badge counts only update on manual refresh or focus
- Badge shows stale count after auto-group completes

**UngroupedPhotosCard**:
- Uses `fetchedRef` guard to prevent re-fetching after mount
- No listener for `subscribeToAutoGroupDone`
- Stale photos and empty placeholders for thumbnails after auto-group

### Git History Timeline

- **June 5**: Added `emitAutoGroupDone()` to post-upload auto-group path
- **June 7**: Archived badge update fix proposal (simplification)
- **June 12**: Added `subscribeToAutoGroupDone()` → `handleRefresh()` and `subscribeToUploadComplete()` → `handleRefresh()`
- **June 14**: Made `handleRefresh()` async with guard to prevent freezes
- **June 15**: "Simplify" commit (9811ac42) removed ALL subscriptions (causing the bug)

### Root Cause

The June 15 commit removed ALL event subscriptions to prevent UI freezes, but this was overkill. The June 12 implementation had a freeze issue (sync `handleRefresh()`), but June 14 fixed this by making `handleRefresh()` async with a guard. The June 15 commit should have only removed the heavy waves refresh, not the lightweight badge updates.

## Goals / Non-Goals

**Goals:**
1. Restore badge updates after auto-group completes (ungrouped count, waves count)
2. Restore badge updates after upload completes (ungrouped count)
3. Fix UngroupedPhotosCard to re-fetch after auto-group completes
4. Keep solution lightweight to prevent UI freezes
5. Follow existing event bus pattern

**Non-Goals:**
- Do NOT call `handleRefresh()` from event listeners (that caused June 12 freezes)
- Do NOT modify GraphQL schema or queries
- Do NOT add new dependencies
- Do NOT change the overall architecture

## Decisions

### Decision 1: Only Restore Badge Subscriptions, NOT Waves Refresh

**Rationale**: The June 12 freeze issue was caused by calling `handleRefresh()` (which resets pagination and fetches full waves list) from event listeners. The June 14 fix made `handleRefresh()` async with a guard, but we should NOT call it from event listeners anyway because:
- Waves list refresh is heavy (fetches all waves + pagination reset)
- Badge updates are lightweight (single GraphQL query)

**Alternative Considered**: Call `handleRefresh()` with the async guard
**Why Not**: Overkill - badge updates only require count queries, not full waves refresh

### Decision 2: Separate Badge Updates in WavesHub and UngroupedPhotosCard

**WavesHub**: Badge updates only (no waves refresh)
```javascript
subscribeToAutoGroupDone(() => fetchCounts())
subscribeToUploadComplete(() => fetchCounts())
```

**UngroupedPhotosCard**: Reset fetch state and re-fetch photos
```javascript
subscribeToAutoGroupDone(() => {
  fetchedRef.current = false
  requestUngroupedPhotos()
})
```

**Alternative Considered**: Single `fetchCounts()` in both components
**Why Not**: UngroupedPhotosCard needs to re-fetch photos (not just counts) because the photos have moved to waves

### Decision 3: Use Apollo `network-only` Fetch Policy

**Rationale**: The `reducer.js` already has `fetchPolicy: 'network-only'` to bypass Apollo cache for count queries. This ensures badge updates reflect server state, not cached values.

**Alternative Considered**: Use cache-first and rely on cache updates
**Why Not**: Cache might be stale after auto-group/upload operations

## Risks / Trade-offs

**Risk**: Event listener might fire before component mounts
→ **Mitigation**: Event bus pattern already handles this - listeners are stored in a Set, so no-op if component unmounted

**Risk**: Multiple rapid events (e.g., upload + auto-group) could cause race conditions
→ **Mitigation**: Each operation is independent; badge counts will eventually converge to correct value

**Risk**: Memory leak if listener not cleaned up
→ **Mitigation**: Event bus returns unsubscribe function; useEffect cleanup handles this

**Risk**: Re-fetch in UngroupedPhotosCard might show empty results if all photos were grouped
→ **Mitigation**: This is correct behavior - if all photos were grouped, the count is 0 and no photos should show

## Migration Plan

**Steps:**
1. Add event subscriptions to WavesHub (restore June 12 approach, badge updates only)
2. Add event subscription to UngroupedPhotosCard (reset fetch state)
3. Verify no lint errors with `npm run lint`
4. Test flow: upload photo → auto-group → badge updates, thumbnails show

**Rollback Strategy:**
- Revert commit `9811ac42` or the new change commit
- No database/schema migrations needed

**Open Questions:**
1. Should `subscribeToUploadComplete()` also trigger WavesHub badge update? (Yes - upload affects ungrouped count)
2. Should badge updates handle both wave-specific and general uploads? (Yes - wave-specific uploads affect wave counts too)
