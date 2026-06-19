## ADDED Requirements

### Requirement: Auto-group completion event

After auto grouping completes (either manually triggered or automatically after upload), the system SHALL emit exactly one `autoGroupDone` event.

#### Scenario: Single emission on manual auto-group completion

- **WHEN** user manually triggers auto-group via WavesHub UI
- **AND** auto-group completes successfully
- **THEN** system emits exactly one `autoGroupDone` event

#### Scenario: Single emission on automatic auto-group completion

- **WHEN** automatic auto-group is triggered after photo upload
- **AND** auto-group completes successfully
- **THEN** system emits exactly one `autoGroupDone` event

### Requirement: Lightweight refresh after auto-group

When `autoGroupDone` event is emitted, the system SHALL update the ungrouped photos count badge by calling `getUngroupedPhotosCount()` instead of performing a full waves reload via `handleRefresh()`.

#### Scenario: Badge update without full waves reload

- **WHEN** `autoGroupDone` event is emitted
- **THEN** system calls `getUngroupedPhotosCount()` to fetch only ungrouped count
- **AND** system updates ungrouped count badge
- **AND** system does NOT call `handleRefresh()` which would reload all waves

### Requirement: Optional debounced waves refresh

After lightweight badge update, the system MAY optionally trigger a debounced waves reload to ensure UI consistency.

#### Scenario: Optional waves refresh

- **WHEN** lightweight badge update completes
- **THEN** system MAY schedule waves reload with 500ms debounce
- **AND** if scheduled, waves reload occurs after debounce period

## MODIFIED Requirements

### Requirement: Auto-group concurrency control

**Reason**: Current implementation has inconsistent concurrency control - manual auto-group uses `autoGroupRunningRef` guard but automatic auto-group via `flushUngroupedPhotos()` does not.

**Migration**: Add `autoGroupRunningRef` check to `flushUngroupedPhotos()` before calling `autoGroupPhotos()`.

**Previous Behavior**: Multiple auto-group operations could be triggered concurrently from different entry points.

**New Behavior**: Auto-group operations are guarded by `autoGroupRunningRef` to prevent concurrent execution.

### Requirement: Advisory lock release

**Reason**: Backend `autoGroupPhotosIntoWaves` might hold advisory lock indefinitely if unhandled error occurs before unlock.

**Migration**: Wrap backend logic in try-catch-finally to ensure `pg_advisory_unlock` is always called.

**Previous Behavior**: If backend threw error before unlock, lock might be held until connection closes.

**New Behavior**: Advisory lock is always released in finally block regardless of error.

## REMOVED Requirements

### Requirement: Double auto-group completion event

**Reason**: Replaced by single emission requirement.

**Migration**: Remove `emitAutoGroupDone()` call from `try` block in `runAutoGroup()`, keep only in `finally` block.

**Previous Behavior**: System emitted `autoGroupDone` event twice - once in try block after success, once in finally block for cleanup.

**New Behavior**: System emits `autoGroupDone` event exactly once in finally block.
