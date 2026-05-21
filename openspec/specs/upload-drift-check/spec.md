# Upload Drift Check

**Purpose**: Verify that photos are captured within the active wave's geo-boundary before upload, and handle drift detection by creating new waves when needed.

## Requirements

### Requirement: Pre-upload drift check
The system SHALL check whether a photo's coordinates fall within the target wave's geo-boundary before uploading the photo, when `grouping.enabled` is `true`. The check SHALL use the `isLocationInWave(lat, lon, waveUuid, uuid)` GraphQL query. Drift check runs at upload time in `processCompleteUpload()` instead of capture time in `useCameraCapture.js`.

#### Scenario: Photo fits current wave (main feed)
- **WHEN** the user captures a photo from a non-wave screen (main feed, bookmarks)
- **AND** `grouping.enabled` is `true`
- **AND** `activeWaveAtom` has a `waveUuid`
- **AND** at upload time, `isLocationInWave(lat, lon, activeWaveUuid, uuid)` returns `true`
- **THEN** the photo SHALL be uploaded with `waveUuid` set to the active wave's UUID

#### Scenario: Photo drifted from current wave (main feed)
- **WHEN** the user captures a photo from a non-wave screen
- **AND** `grouping.enabled` is `true`
- **AND** at upload time, `isLocationInWave(lat, lon, activeWaveUuid, uuid)` returns `false`
- **THEN** the system SHALL create a new wave via `createWave(name)`
- **THEN** the photo SHALL be uploaded with `waveUuid` set to the newly created wave's UUID

#### Scenario: No active wave exists (main feed)
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

#### Scenario: Photo drifted from viewed wave (wave detail screen)
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

### Requirement: isLocationInWave GraphQL query
The system SHALL provide an `isLocationInWave` function in the waves reducer that calls the `isLocationInWave(lat: Float!, lon: Float!, waveUuid: String!, uuid: String!): Boolean!` GraphQL query.

#### Scenario: Query returns true
- **WHEN** `isLocationInWave` is called with coordinates within the wave's geo-boundary
- **THEN** the function SHALL return `true`

#### Scenario: Query returns false
- **WHEN** `isLocationInWave` is called with coordinates outside the wave's geo-boundary
- **THEN** the function SHALL return `false`

#### Scenario: Query fails
- **WHEN** `isLocationInWave` encounters a network error
- **THEN** the function SHALL throw the error to be handled by the caller
