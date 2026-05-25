## REMOVED Requirements

### Requirement: Wave assignment at upload time
**Reason**: The "active wave" concept that powered upload-time wave assignment no longer exists. The backend now dynamically matches photos to waves during `autoGroupPhotosIntoWaves`. Photos upload as ungrouped and get assigned by the next auto-group run (which already runs via `flushUngroupedPhotos` before each upload).
**Migration**: Remove `checkAndAssignWave` function from `photoUploadService.js`. Remove the `saveActiveWave` call after new wave creation during upload. The `flushUngroupedPhotos` call remains and handles wave assignment via the backend.

### Requirement: Drift check when network available
**Reason**: Drift checking relied on loading the active wave and calling `isLocationInWave`. With no active wave, there is no reference point for client-side drift detection. The backend handles proximity matching internally.
**Migration**: Remove the `isLocationInWave` check path from `processCompleteUpload`. Photos upload without a `waveUuid` when no explicit wave context is provided.

### Requirement: Wave assignment error handling
**Reason**: The wave assignment error handling was for `isLocationInWave` and `createWave` calls during upload-time drift detection, which is being removed entirely.
**Migration**: No replacement needed. Upload errors are handled by existing upload error handling. Wave assignment errors cannot occur when no wave assignment is attempted.

## MODIFIED Requirements

### Requirement: Flush ungrouped photos before upload
The system SHALL flush any pending ungrouped photos via `autoGroupPhotosIntoWaves` before processing each photo for upload, ensuring uploads start from a clean state. **When auto-grouping is disabled (`grouping.enabled === false`), the flush step SHALL be skipped entirely.**

#### Scenario: Ungrouped photos exist — flush before upload
- **WHEN** `processCompleteUpload` is called and there are pending ungrouped photos in the queue
- **AND** grouping is enabled
- **THEN** the system SHALL call `autoGroupPhotosIntoWaves` to process them first
- **THEN** after flushing, proceed with uploading the current photo as ungrouped (no client-side wave assignment)

#### Scenario: No ungrouped photos — skip flush
- **WHEN** `processCompleteUpload` is called and there are no pending ungrouped photos
- **THEN** the system SHALL skip the flush step
- **THEN** proceed directly to uploading the current photo as ungrouped

#### Scenario: Auto-grouping disabled — skip flush entirely
- **WHEN** `processCompleteUpload` is called with grouping disabled (`grouping.enabled === false`)
- **AND** there are pending ungrouped photos in the queue
- **THEN** the system SHALL skip the flush step regardless of pending items
