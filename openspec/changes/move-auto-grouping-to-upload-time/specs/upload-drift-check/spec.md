## MODIFIED Requirements

### Requirement: Pre-upload drift check
The system SHALL check whether a photo's coordinates fall within the target wave's geo-boundary before uploading the photo, when `grouping.enabled` is `true`. The check SHALL use the `isLocationInWave(lat, lon, waveUuid, uuid)` GraphQL query. **MODIFIED**: Drift check now runs at upload time in `processCompleteUpload()` instead of capture time in `useCameraCapture.js`.

#### Scenario: Photo fits current wave (main feed)
- **WHEN** the user captures a photo from a non-wave screen (main feed, bookmarks)
- **AND** `grouping.enabled` is `true`
- **AND** `activeWaveAtom` has a `waveUuid`
- **AND** at upload time, `isLocationInWave(lat, lon, activeWaveUuid, uuid)` returns `true`
- **THEN** the photo SHALL be uploaded with `waveUuid` set to the active wave's UUID

#### Scenario: Photo drifted from current wave (main feed) — new behavior
- **WHEN** the user captures a photo from a non-wave screen
- **AND** `grouping.enabled` is `true`
- **AND** at upload time, `isLocationInWave(lat, lon, activeWaveUuid, uuid)` returns `false`
- **THEN** the system SHALL create a new wave via `createWave(name)`
- **THEN** the photo SHALL be uploaded with `waveUuid` set to the newly created wave's UUID

#### Scenario: No active wave exists (main feed) — new behavior
- **WHEN** the user captures a photo from a non-wave screen
- **AND** `grouping.enabled` is `true`
- **AND** at upload time, `activeWaveAtom` is `null`
- **THEN** the system SHALL create a new wave via `createWave(name)`
- **THEN** the photo SHALL be uploaded with `waveUuid` set to the newly created wave's UUID

#### Scenario: Photo fits viewed wave (wave detail screen)
- **WHEN** the user captures a photo from the wave detail screen
- **AND** `grouping.enabled` is `true`
- **AND** at upload time, `isLocationInWave(lat, lon, viewedWaveUuid, uuid)` returns `true`
- **THEN** the photo SHALL be uploaded with `waveUuid` set to the viewed wave's UUID

#### Scenario: Photo drifted from viewed wave (wave detail screen) — new behavior
- **WHEN** the user captures a photo from the wave detail screen
- **AND** `grouping.enabled` is `true`
- **AND** at upload time, `isLocationInWave(lat, lon, viewedWaveUuid, uuid)` returns `false`
- **THEN** the system SHALL create a new wave via `createWave(name)`
- **THEN** the photo SHALL be uploaded with `waveUuid` set to the newly created wave's UUID

#### Scenario: Auto-grouping disabled
- **WHEN** the user captures a photo from any screen
- **AND** `grouping.enabled` is `false`
- **THEN** no `isLocationInWave` check SHALL be performed at upload time
- **THEN** the photo SHALL be uploaded with whatever `waveUuid` the screen provides (or `undefined`)

#### Scenario: Offline during drift check
- **WHEN** the user captures a photo
- **AND** `grouping.enabled` is `true`
- **AND** at upload time, the device has no network connectivity
- **THEN** the `isLocationInWave` check SHALL be skipped
- **THEN** the photo SHALL be uploaded without a `waveUuid` (ungrouped)

### Requirement: Drift detection toast notification — REMOVED
- **Reason**: Toast UX for drift-based new wave creation is no longer needed at capture time since capture is simplified. A new requirement in upload-wave-assignment handles post-upload notifications if desired.
- **Migration**: Remove toast logic from `useCameraCapture.js`. Consider adding a subtle toast after upload completes if a new wave was created.

### Requirement: Concurrent capture serialization — REMOVED
- **Reason**: Capture no longer performs drift checking, so concurrent capture serialization is unnecessary. The upload pipeline handles ordering via its queue-based model.
- **Migration**: Remove `driftCheckRef` and related serialization logic from `useCameraCapture.js`.
