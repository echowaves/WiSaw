## MODIFIED Requirements

### Requirement: Wave-Tagged Photo Uploads
The system SHALL attach a wave UUID to uploaded photos when a `waveUuid` is provided by the screen context (e.g., the Wave Detail footer camera). Upload completion notifications SHALL be broadcast via the upload event bus with the queue item's `waveUuid` metadata, replacing per-screen `onPhotoUploaded` callbacks.

#### Scenario: Photo captured from wave detail screen
- **WHEN** the user captures or selects a photo from a screen that provides a `waveUuid` context
- **THEN** the photo is queued with that `waveUuid`
- **THEN** after upload, `addPhotoToWave` mutation is called to associate the photo with the wave
- **THEN** the upload bus SHALL emit `{ photo, waveUuid }` with the queue item's `waveUuid`

#### Scenario: Photo captured from main feed
- **WHEN** the user captures or selects a photo from the main feed (no `waveUuid` context)
- **THEN** the photo is uploaded without any wave association
- **THEN** the upload bus SHALL emit `{ photo, waveUuid: undefined }`

#### Scenario: Wave UUID is passed through footer
- **WHEN** the `PhotosListFooter` has a `waveUuid` prop set
- **THEN** photos captured from that footer's camera SHALL be tagged with that `waveUuid`
