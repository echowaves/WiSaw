## MODIFIED Requirements

### Requirement: Wave assignment at upload time
The system SHALL assign a wave UUID to each photo during upload by loading the current active wave, checking location drift via `isLocationInWave(lat, lon, waveUuid)`, and assigning the photo to either the current wave or a newly created one. **When auto-grouping is disabled (`grouping.enabled === false`), this entire step SHALL be skipped and the photo SHALL remain ungrouped.**

#### Scenario: Photo fits current active wave
- **WHEN** `processCompleteUpload` is called for a photo with grouping enabled
- **AND** `loadActiveWave()` returns an active wave UUID
- **AND** `isLocationInWave(lat, lon, activeWaveUuid)` returns `true`
- **THEN** the photo SHALL be enqueued with `waveUuid` set to the active wave's UUID

#### Scenario: Photo drifted from current active wave — create new wave
- **WHEN** `processCompleteUpload` is called for a photo with grouping enabled
- **AND** `loadActiveWave()` returns an active wave UUID
- **AND** `isLocationInWave(lat, lon, waveUuid)` returns `false` (drifted)
- **THEN** the system SHALL call `createWave(name)` to create a new wave
- **THEN** the photo SHALL be enqueued with `waveUuid` set to the newly created wave's UUID

#### Scenario: No active wave exists — create new wave
- **WHEN** `processCompleteUpload` is called for a photo with grouping enabled
- **AND** `loadActiveWave()` returns `null` (no active wave)
- **THEN** the system SHALL call `createWave(name)` to create a new wave
- **THEN** the photo SHALL be enqueued with `waveUuid` set to the newly created wave's UUID

#### Scenario: New wave naming convention
- **WHEN** a new wave is created during upload due to drift or no active wave
- **THEN** the wave name SHALL use format `"Location - Month Day, Year"` (e.g., "Downtown - May 21, 2026")

#### Scenario: Active wave updated after new wave creation
- **WHEN** a new wave is created during upload
- **THEN** `activeWaveAtom` SHALL be updated with the new wave's UUID and name
- **THEN** `saveActiveWave()` SHALL be called to persist the change in AsyncStorage

#### Scenario: Auto-grouping disabled — skip wave assignment
- **WHEN** `processCompleteUpload` is called for a photo with grouping disabled (`grouping.enabled === false`)
- **THEN** the system SHALL skip both `flushUngroupedPhotos()` and `checkAndAssignWave()`
- **THEN** the photo SHALL be enqueued without a `waveUuid` (ungrouped)

#### Scenario: Auto-grouping disabled — photos accumulate in UngroupedPhotosCard
- **WHEN** multiple photos are uploaded with grouping disabled
- **THEN** all photos SHALL remain ungrouped (no `waveUuid`)
- **THEN** the ungrouped photo count displayed by `UngroupedPhotosCard` SHALL increase

### Requirement: Flush ungrouped photos before upload
The system SHALL flush any pending ungrouped photos via `autoGroupPhotosIntoWaves` before processing each photo for upload, ensuring uploads start from a clean state. **When auto-grouping is disabled (`grouping.enabled === false`), the flush step SHALL be skipped entirely.**

#### Scenario: Ungrouped photos exist — flush before upload
- **WHEN** `processCompleteUpload` is called and there are pending ungrouped photos in the queue
- **AND** grouping is enabled
- **THEN** the system SHALL call `autoGroupPhotosIntoWaves` to process them first
- **THEN** after flushing, proceed with the current photo's wave assignment

#### Scenario: No ungrouped photos — skip flush
- **WHEN** `processCompleteUpload` is called and there are no pending ungrouped photos
- **THEN** the system SHALL skip the flush step
- **THEN** proceed directly to wave assignment for the current photo

#### Scenario: Auto-grouping disabled — skip flush entirely
- **WHEN** `processCompleteUpload` is called with grouping disabled (`grouping.enabled === false`)
- **AND** there are pending ungrouped photos in the queue
- **THEN** the system SHALL skip the flush step regardless of pending items
