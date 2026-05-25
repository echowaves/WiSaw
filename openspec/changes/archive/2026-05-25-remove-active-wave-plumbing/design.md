## Context

The backend replaced the "single active wave" model with a "find matching existing wave" approach in `autoGroupPhotosIntoWaves`. The `isActive` field was removed from the Wave GraphQL type and database model. The frontend still queries `isActive` (causing a crash), persists active wave in SecureStore, and uses it for upload-time wave assignment and drift detection — all of which is now dead code against the new backend.

Current frontend active wave flow:
1. App startup → hydrate `activeWaveAtom` from SecureStore
2. WavesHub refresh → sync active wave from `listWaves` `isActive` field
3. Photo upload → `checkAndAssignWave` loads active wave, checks `isLocationInWave`, assigns or creates
4. Auto-group complete → save last wave as active
5. Wave deleted → clear active wave if it was the deleted one

New backend flow: `autoGroupPhotosIntoWaves` dynamically searches all user waves for a matching one (same locality + season + groupingLevel) or creates a new one. No server-side "active" concept exists.

## Goals / Non-Goals

**Goals:**
- Fix the `isActive` GraphQL crash immediately
- Remove all active wave state management (atom, storage, hydration)
- Simplify upload flow — photos upload as ungrouped, backend auto-grouping handles wave assignment
- Remove dead `checkAndAssignWave` and `isLocationInWave` client-side drift logic

**Non-Goals:**
- Changing the backend auto-grouping algorithm (already done separately)
- Adding new upload-time wave assignment logic to replace the removed one
- Modifying the auto-group loop mechanism (`do/while hasMore`)

## Decisions

### 1. Remove rather than replace active wave tracking
**Decision**: Delete `activeWaveStorage.js`, `activeWaveAtom`, and all hydration/sync code entirely.
**Rationale**: The backend now owns wave matching. There is no client-side use case for knowing which wave is "active" — the concept doesn't exist anymore.
**Alternative**: Keep a client-side "last used wave" for display purposes → rejected because it has no functional use and adds complexity for zero benefit.

### 2. Upload flow: let photos be ungrouped
**Decision**: Remove `checkAndAssignWave` from the upload path. Photos upload without a `waveUuid`. The existing `flushUngroupedPhotos` call (which runs `autoGroupPhotosIntoWaves`) handles wave assignment.
**Rationale**: `checkAndAssignWave` duplicated wave-matching logic client-side using the stale active wave. The backend's `findOrCreateWave` is now the single source of truth. Uploading as ungrouped and then running auto-group is the intended flow.
**Alternative**: Implement new client-side matching to pre-assign waves at upload → rejected because it duplicates backend logic and can drift out of sync.

### 3. Remove `isActive` from listWaves query only (no other GraphQL changes)
**Decision**: Only remove the `isActive` field from the `listWaves` query. No other GraphQL operations are affected.
**Rationale**: `isActive` was only requested in `listWaves`. The auto-group mutation response fields (`waveUuid`, `name`, `photosGrouped`, `hasMore`, etc.) remain unchanged.

## Risks / Trade-offs

- **[Photos briefly ungrouped]** → Photos will be ungrouped between upload and the next auto-group run. Mitigated by `flushUngroupedPhotos` running before each upload in `processCompleteUpload`.
- **[Stale SecureStore key]** → The `@activeWave` key may remain in users' SecureStore after the update. No impact — it will simply never be read again. No migration needed.
- **[Removed `checkAndAssignWave` was called during upload]** → The upload path will no longer pre-assign waves. The `waveUuid` on processed items will be `null` when grouping is enabled. The `addPhotoToWave` mutation call that follows will be skipped (it's gated on `assignedWaveUuid` being truthy). Photos become ungrouped and `flushUngroupedPhotos` picks them up.
