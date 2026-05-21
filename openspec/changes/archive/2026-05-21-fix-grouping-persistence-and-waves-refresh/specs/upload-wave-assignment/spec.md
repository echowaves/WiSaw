## MODIFIED Requirements

### Requirement: Wave assignment at upload time
The system SHALL assign a wave UUID to each photo during upload by loading the current active wave, checking location drift via `isLocationInWave(lat, lon, waveUuid)`, and assigning the photo to either the current wave or a newly created one. **When auto-grouping is disabled (`grouping.enabled === false`), the system SHALL skip all wave assignment logic and upload the photo as ungrouped regardless of screen context — no `waveUuid` SHALL be passed to `enqueueCapture`, even when the capture originates from a wave detail screen.**

#### Scenario: Photo captured with grouping disabled (any screen)
- **WHEN** a photo is captured from any screen (main feed, wave detail, bookmarks)
- **AND** `grouping.enabled` is `false`
- **THEN** the photo SHALL be enqueued without a `waveUuid` (ungrouped)
- **THEN** no `isLocationInWave` check SHALL be performed
- **THEN** no auto-group mutation SHALL be called

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
