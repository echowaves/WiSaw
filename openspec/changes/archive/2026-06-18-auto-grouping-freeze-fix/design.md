## Context

**Current State:**
- Auto grouping runs in two modes: manual (via WavesHub UI) and automatic (after upload via `flushUngroupedPhotos`)
- Both modes call `emitAutoGroupDone()` after completion
- `emitAutoGroupDone()` triggers `handleRefresh()` in WavesHub which reloads ALL waves via GraphQL
- `emitAutoGroupDone()` is called twice: once in `try` block (after success) and once in `finally` block (cleanup)
- `flushUngroupedPhotos()` doesn't check `autoGroupRunningRef`, risking concurrent execution with manual auto-group
- Backend has per-user advisory lock but no try-catch, risking lock hold if error occurs

**Key Files:**
- `src/screens/WavesHub/index.js` - `runAutoGroup()`, `handleRefresh()`, `subscribeToAutoGroupDone`
- `src/screens/PhotosList/upload/photoUploadService.js` - `flushUngroupedPhotos()`
- `src/events/autoGroupBus.js` - Event bus for auto-group completion
- `lambda-fns/controllers/waves/autoGroupPhotosIntoWaves.ts` - Backend resolver

**Constraints:**
- Must maintain existing event bus architecture
- Must not break manual vs automatic auto-group distinction
- Must handle concurrent execution gracefully

## Goals / Non-Goals

**Goals:**
1. Eliminate UI freeze after auto-group completes
2. Prevent duplicate `emitAutoGroupDone()` calls
3. Replace expensive full waves reload with lightweight badge update
4. Ensure advisory lock is always released even on error
5. Prevent concurrent auto-group execution

**Non-Goals:**
1. Change auto-group algorithm or grouping logic
2. Add new UI components or screens
3. Modify backend data model or GraphQL schema
4. Change user experience of manual auto-group (still shows confirmation dialog)

## Decisions

### 1. Single Emission Instead of Double

**Decision:** Remove `emitAutoGroupDone()` from `try` block, keep only in `finally` block.

**Rationale:** The current double emission causes `handleRefresh()` to be called twice, potentially overwhelming the UI. Using `finally` ensures emission happens exactly once regardless of success or error.

**Alternatives Considered:**
- Keep both and add deduplication in listener - more complex, doesn't address root cause
- Use flag to track emission - adds state complexity

### 2. Lightweight Refresh Instead of Full Reload

**Decision:** Replace `handleRefresh()` with `getUngroupedPhotosCount()` call that only updates the badge count.

**Rationale:** The freeze happens because `handleRefresh()` reloads ALL waves via GraphQL. After auto-group, users only need to see updated ungrouped count badge. Full waves reload is unnecessary and expensive.

**Alternatives Considered:**
- Add loading indicator during refresh - users still see freeze, just informed
- Debounce `handleRefresh()` - partial fix, doesn't address unnecessary data fetch
- Use optimistic updates - complex, requires tracking all wave modifications

### 3. Optional Debounced Waves Refresh

**Decision:** Add optional `setTimeout(() => handleRefresh(), 500)` after lightweight update for cases where users want to see wave updates immediately.

**Rationale:** Some users might want to see wave counts update after auto-group. Offering optional debounced refresh balances performance with user expectations.

**Alternatives Considered:**
- Always refresh - defeats purpose of lightweight update
- Never refresh - users might not see updates until manual refresh

### 4. Concurrency Guard for flushUngroupedPhotos

**Decision:** Add check for `autoGroupRunningRef` in `flushUngroupedPhotos()` before starting auto-group.

**Rationale:** `flushUngroupedPhotos()` runs in `usePhotoUploader` without any concurrency guard, risking conflict with manual auto-group from WavesHub. Backend advisory lock prevents concurrent execution there, but frontend should also guard.

**Alternatives Considered:**
- Rely solely on backend lock - frontend should also guard for better UX
- Queue flush operations - more complex, might delay auto-group

### 5. Backend Error Handling with Advisory Lock

**Decision:** Wrap backend logic in try-catch-finally to ensure advisory lock is always released.

**Rationale:** If unhandled error occurs before `pg_advisory_unlock`, lock is held until connection closes. This could block future auto-group operations.

**Alternatives Considered:**
- Document error handling responsibility - shifts burden to caller, less robust
- Use automatic lock timeout - PostgreSQL has timeout but not ideal for all cases

## Risks / Trade-offs

**[Risk]** Users might not see immediate wave count updates after auto-group  
**[Mitigation]** Optional debounced waves refresh after 500ms ensures eventual consistency

**[Risk]** If waves are modified externally during auto-group (e.g., web admin), UI might be stale  
**[Mitigation]** Users can manually pull to refresh; debounced refresh also mitigates this

**[Risk]** Removing duplicate emission might affect other listeners expecting two events  
**[Mitigation]** Check `autoGroupBus.js` - only WavesHub listens to `emitAutoGroupDone()`, no other consumers

**[Risk]** Backend error handling might mask errors from caller  
**[Mitigation]** Re-throw errors after cleanup, caller still receives error details

**[Risk]** Concurrency guard in `flushUngroupedPhotos()` might skip auto-group if manual is running  
**[Mitigation]** Backend advisory lock prevents actual concurrent execution; frontend guard is best-effort

## Migration Plan

**Deployment:**
1. Deploy changes to `src/screens/WavesHub/index.js` (single emission, lightweight refresh)
2. Deploy changes to `src/screens/PhotosList/upload/photoUploadService.js` (concurrency guard)
3. Deploy changes to `lambda-fns/controllers/waves/autoGroupPhotosIntoWaves.ts` (error handling)

**Rollback Strategy:**
- Revert all three files to previous commit
- No database migrations required
- No configuration changes required

**Testing:**
1. Manual auto-group with many photos - verify no freeze
2. Automatic auto-group after upload - verify badge updates correctly
3. Concurrent manual auto-group during flush - verify one is skipped
4. Backend error during auto-group - verify lock released and error propagated
