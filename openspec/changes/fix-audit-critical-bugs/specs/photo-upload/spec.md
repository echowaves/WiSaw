## MODIFIED Requirements

### Requirement: Wave-Tagged Photo Uploads
The system SHALL attach a wave UUID to uploaded photos when a `waveUuid` is provided by the screen context (e.g., the Wave Detail footer camera). The camera capture hook SHALL pass the screen-provided `waveUuid` through to the upload queue in every grouping state (grouping disabled, offline, and online). Upload completion notifications SHALL be broadcast via the upload event bus with the queue item's `waveUuid` metadata, replacing per-screen `onPhotoUploaded` callbacks.

#### Scenario: Photo captured from wave detail screen
- **WHEN** the user captures or selects a photo from a screen that provides a `waveUuid` context
- **THEN** the camera capture hook SHALL enqueue the photo with that `waveUuid`
- **THEN** after upload, `addPhotoToWave` mutation is called to associate the photo with the wave
- **THEN** the upload bus SHALL emit `{ photo, waveUuid }` with the queue item's `waveUuid`

#### Scenario: Wave capture while grouping is disabled
- **WHEN** the user captures a photo from a screen that provides a `waveUuid` context
- **AND** auto-grouping is disabled (`grouping.enabled === false`)
- **THEN** the photo SHALL still be enqueued with that `waveUuid`

#### Scenario: Wave capture while offline
- **WHEN** the user captures a photo from a screen that provides a `waveUuid` context
- **AND** the device is offline
- **THEN** the photo SHALL be enqueued with that `waveUuid` for upload when connectivity returns

#### Scenario: Photo captured from main feed
- **WHEN** the user captures or selects a photo from the main feed (no `waveUuid` context)
- **THEN** the photo is uploaded without any wave association
- **THEN** the upload bus SHALL emit `{ photo, waveUuid: undefined }`

#### Scenario: Wave UUID is passed through footer
- **WHEN** the `PhotosListFooter` has a `waveUuid` prop set
- **THEN** photos captured from that footer's camera SHALL be tagged with that `waveUuid`
