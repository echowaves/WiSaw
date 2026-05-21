# Upload Wave Assignment Specification

## Purpose
Wave assignment logic runs during photo upload (not capture time). Before uploading each photo, the system loads the current active wave, checks if the photo's location fits within it via `isLocationInWave`, and either assigns to the current wave or creates a new one.

## Requirements

### Requirement: Wave assignment at upload time
The system SHALL assign a wave UUID to each photo during upload by loading the current active wave, checking location drift via `isLocationInWave(lat, lon, waveUuid)`, and assigning the photo to either the current wave or a newly created one.

#### Scenario: Photo fits current active wave
- **WHEN** `processCompleteUpload` is called for a photo with grouping enabled
- **AND** `loadActiveWave()` returns an active wave UUID
- **AND** `isLocationInWave(lat, lon, activeWaveUuid)` returns `true`
- **THEN** the photo SHALL be enqueued with `waveUuid` set to the active wave's UUID

#### Scenario: Photo drifted from current active wave — create new wave
- **WHEN** `processCompleteUpload` is called for a photo with grouping enabled
- **AND** `loadActiveWave()` returns an active wave UUID
- **AND** `isLocationInWave(lat, lon, activeWaveUuid)` returns `false` (drifted)
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

### Requirement: Flush ungrouped photos before upload
The system SHALL flush any pending ungrouped photos via `autoGroupPhotosIntoWaves` before processing each photo for upload, ensuring uploads start from a clean state.

#### Scenario: Ungrouped photos exist — flush before upload
- **WHEN** `processCompleteUpload` is called and there are pending ungrouped photos in the queue
- **THEN** the system SHALL call `autoGroupPhotosIntoWaves` to process them first
- **THEN** after flushing, proceed with the current photo's wave assignment

#### Scenario: No ungrouped photos — skip flush
- **WHEN** `processCompleteUpload` is called and there are no pending ungrouped photos
- **THEN** the system SHALL skip the flush step
- **THEN** proceed directly to wave assignment for the current photo

### Requirement: Drift check when network available
The drift check via `isLocationInWave` SHALL run only when network connectivity is confirmed and the photo has been processed locally.

#### Scenario: Network available — perform drift check
- **WHEN** `processCompleteUpload` runs and `netAvailable` is `true`
- **THEN** the system SHALL call `isLocationInWave(lat, lon, waveUuid)` for wave assignment

#### Scenario: No network — skip drift check
- **WHEN** `processCompleteUpload` runs and `netAvailable` is `false`
- **THEN** the system SHALL skip the drift check
- **THEN** the photo SHALL be enqueued without a `waveUuid` (ungrouped)

### Requirement: Wave assignment error handling
If wave assignment fails during upload, the system SHALL handle errors gracefully and fall back to ungrouped upload.

#### Scenario: isLocationInWave query fails
- **WHEN** `isLocationInWave(lat, lon, waveUuid)` throws an error
- **THEN** the photo SHALL be enqueued without a `waveUuid` (ungrouped)
- **THEN** an error log entry SHALL be created

#### Scenario: createWave mutation fails
- **WHEN** `createWave(name)` throws an error during drift-based new wave creation
- **THEN** the photo SHALL be enqueued without a `waveUuid` (ungrouped)
- **THEN** an error toast SHALL be shown to the user
