## Purpose

Define upload batch lifecycle and auto-group flush orchestration: ensure flush fires only after actual uploads, prevent concurrent flush scheduling, and guard against concurrent `runAutoGroup` execution.

## MODIFIED Requirements

### Requirement: Upload completion does not fetch ungrouped photo count
The system SHALL NOT call `getUngroupedPhotosCount` API when photo upload completes. The upload completion handler SHALL only trigger a waves feed refresh via `handleRefresh()`.

#### Scenario: Upload complete event
- **WHEN** a photo upload completes successfully
- **THEN** the system SHALL call `handleRefresh()` to refresh the waves feed
- **THEN** the system SHALL NOT call `getUngroupedPhotosCount`

#### Scenario: No ungrouped count badge update needed
- **WHEN** upload completes
- **THEN** no ungrouped photo count badge update shall be performed
- **THEN** the `ungroupedPhotosCount` Jotai atom shall remain unchanged

## REMOVED Requirements

### Requirement: Flush ungrouped photos after upload
**Reason**: Auto-grouping is now server-side only; client-side flush of ungrouped photos is no longer needed.
**Migration**: Auto-grouping is triggered server-side after upload via `onPhotoUploadComplete` subscription notification.

## ADDED Requirements

### Requirement: Flush scheduled only after actual uploads in a batch

The system SHALL use a single `needsFlushRef` flag that is set to true when `processQueue()` starts with a non-empty queue, and reset in the `finally` block after scheduling the flush. This ensures flush is only triggered when uploads actually occurred, not on empty queue checks.

#### Scenario: Upload batch processes then flush scheduled

- **WHEN** `processQueue()` starts with a non-empty queue
- **THEN** `needsFlushRef.current` SHALL be set to true
- **WHEN** all uploads in the batch complete
- **THEN** the `finally` block SHALL schedule a flush timer (5-second delay)
- **THEN** `needsFlushRef.current` SHALL be reset to false immediately

#### Scenario: Empty queue on startup does not trigger flush

- **WHEN** `processQueue()` is called on app startup and the queue is empty
- **THEN** `needsFlushRef.current` SHALL remain false
- **THEN** no flush timer SHALL be scheduled in the `finally` block

#### Scenario: Multiple processQueue calls do not stack flush timers

- **WHEN** `processQueue()` is called multiple times (e.g., pull-to-refresh, navigation) within the same batch cycle
- **THEN** `needsFlushRef.current` SHALL be overwritten on each entry (idempotent — true if queue has items, false if empty)
- **THEN** at most one flush timer SHALL be scheduled per batch completion

#### Scenario: Grouping disabled skips flush entirely

- **WHEN** `_groupingState.enabled` is false
- **THEN** no flush timer SHALL be scheduled even if `needsFlushRef.current` is true
- **THEN** `needsFlushRef.current` SHALL remain set (no reset without scheduling)

### Requirement: Prevent concurrent runAutoGroup execution

The system SHALL guard `runAutoGroup()` in `WavesHub/index.js` with an `autoGroupRunningRef` to prevent concurrent execution when multiple auto-group events fire.

#### Scenario: Second auto-group trigger while first is running

- **WHEN** `runAutoGroup()` is executing (e.g., triggered by upload flush)
- **WHEN** a second auto-group event fires (e.g., from WavesExplainerView or UngroupedPhotosCard)
- **THEN** the second call SHALL return early without executing
- **THEN** the first call SHALL complete normally

#### Scenario: Auto-group guard resets after completion

- **WHEN** `runAutoGroup()` completes (success or error)
- **THEN** `autoGroupRunningRef.current` SHALL be reset to false in the finally block
- **THEN** subsequent auto-group triggers SHALL be allowed to execute
