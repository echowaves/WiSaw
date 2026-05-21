# Upload Drift Check

**Purpose**: Verify that photos are captured within the active wave's geo-boundary before upload, and handle drift detection by creating new waves when needed.

## Requirements

### Requirement: Pre-upload drift check
The system SHALL check whether a photo's coordinates fall within the target wave's geo-boundary before enqueueing the photo for upload, when `grouping.enabled` is `true`. The check SHALL use the `isLocationInWave(lat, lon, waveUuid, uuid)` GraphQL query.

#### Scenario: Photo fits current wave (main feed)
- **WHEN** the user captures a photo from a non-wave screen (main feed, bookmarks)
- **AND** `grouping.enabled` is `true`
- **AND** `activeWaveAtom` has a `waveUuid`
- **AND** `isLocationInWave(lat, lon, activeWaveUuid, uuid)` returns `true`
- **THEN** the photo SHALL be enqueued with `waveUuid` set to the active wave's UUID
- **THEN** no auto-group mutation SHALL be called

#### Scenario: Photo drifted from current wave (main feed)
- **WHEN** the user captures a photo from a non-wave screen
- **AND** `grouping.enabled` is `true`
- **AND** `activeWaveAtom` has a `waveUuid`
- **AND** `isLocationInWave(lat, lon, activeWaveUuid, uuid)` returns `false`
- **THEN** the system SHALL call `autoGroupPhotosIntoWaves` to flush existing ungrouped photos to the old wave
- **THEN** the photo SHALL be enqueued without a `waveUuid` (ungrouped)
- **THEN** the system SHALL call `autoGroupPhotosIntoWaves` again to create a new wave from the uploaded photo
- **THEN** `activeWaveAtom` SHALL be updated if `isNewWave: true`

#### Scenario: No active wave exists (main feed)
- **WHEN** the user captures a photo from a non-wave screen
- **AND** `grouping.enabled` is `true`
- **AND** `activeWaveAtom` is `null`
- **THEN** the photo SHALL be enqueued without a `waveUuid` (ungrouped)
- **THEN** the system SHALL call `autoGroupPhotosIntoWaves` immediately after upload completes
- **THEN** `activeWaveAtom` SHALL be updated with the newly created wave

#### Scenario: Photo fits viewed wave (wave detail screen)
- **WHEN** the user captures a photo from the wave detail screen
- **AND** `grouping.enabled` is `true`
- **AND** `isLocationInWave(lat, lon, viewedWaveUuid, uuid)` returns `true`
- **THEN** the photo SHALL be enqueued with `waveUuid` set to the viewed wave's UUID

#### Scenario: Photo drifted from viewed wave (wave detail screen)
- **WHEN** the user captures a photo from the wave detail screen
- **AND** `grouping.enabled` is `true`
- **AND** `isLocationInWave(lat, lon, viewedWaveUuid, uuid)` returns `false`
- **THEN** the `waveUuid` SHALL be dropped
- **THEN** the photo SHALL follow the generic ungrouped upload path (same as main feed drift case)
- **THEN** a toast SHALL explain that the photo was uploaded to a different wave due to location change

#### Scenario: Auto-grouping disabled
- **WHEN** the user captures a photo from any screen
- **AND** `grouping.enabled` is `false`
- **THEN** no `isLocationInWave` check SHALL be performed
- **THEN** the photo SHALL be enqueued with whatever `waveUuid` the screen provides (or `undefined`)

#### Scenario: Offline during drift check
- **WHEN** the user captures a photo
- **AND** `grouping.enabled` is `true`
- **AND** the device has no network connectivity
- **THEN** the `isLocationInWave` check SHALL be skipped
- **THEN** the photo SHALL be enqueued without a `waveUuid` (ungrouped)
- **THEN** no auto-group SHALL be attempted

### Requirement: Drift detection toast notification
The system SHALL display a toast notification when drift detection causes a new wave to be created, informing the user of the location change and new wave name.

#### Scenario: New wave created after drift
- **WHEN** the drift-check flow completes and `autoGroupPhotosIntoWaves` returns `isNewWave: true`
- **THEN** a toast SHALL be displayed with text "Moved to new location — wave '<name>' created"
- **THEN** the toast type SHALL be `success`

#### Scenario: Wave detail drift notification
- **WHEN** a photo captured from wave detail is redirected to the generic ungrouped path due to drift
- **THEN** a toast SHALL be displayed explaining the photo was not added to the viewed wave because the user's location has changed

### Requirement: Concurrent capture serialization
The system SHALL serialize drift-check operations to prevent race conditions when multiple photos are captured rapidly at a new location. While an auto-group operation is in progress, subsequent captures SHALL wait for completion before performing their own `isLocationInWave` check.

#### Scenario: Rapid captures at new location
- **WHEN** the user captures 3 photos rapidly at a new location
- **THEN** the first capture SHALL trigger the full drift sequence (flush old, upload, create new wave)
- **THEN** the second and third captures SHALL wait for the first to complete
- **THEN** after the first completes, the second and third SHALL check `isLocationInWave` against the newly created wave
- **THEN** the second and third photos SHALL be enqueued with the new wave's UUID

#### Scenario: Rapid captures at same location
- **WHEN** the user captures multiple photos rapidly at the same location as the active wave
- **THEN** each `isLocationInWave` check SHALL return `true`
- **THEN** no serialization delay SHALL occur (checks are independent)

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
