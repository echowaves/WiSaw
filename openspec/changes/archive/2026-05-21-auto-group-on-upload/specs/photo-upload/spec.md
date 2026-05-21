## MODIFIED Requirements

### Requirement: Wave-Tagged Photo Uploads
The system SHALL attach a wave UUID to uploaded photos when a `waveUuid` is provided by the screen context (e.g., the Wave Detail footer camera) OR when the pre-upload drift check determines the photo fits the active wave. Upload completion notifications SHALL be broadcast via the upload event bus with the queue item's `waveUuid` metadata. When `grouping.enabled` is `true`, the `waveUuid` SHALL be determined dynamically by the drift-check logic in `useCameraCapture` rather than being static per screen.

#### Scenario: Photo captured from wave detail screen with grouping enabled
- **WHEN** the user captures a photo from a screen that provides a `waveUuid` context
- **AND** `grouping.enabled` is `true`
- **THEN** the system SHALL check `isLocationInWave` against the provided `waveUuid`
- **THEN** if the photo fits, it SHALL be queued with that `waveUuid`
- **THEN** if the photo does not fit, the `waveUuid` SHALL be dropped and the photo SHALL follow the generic ungrouped upload path

#### Scenario: Photo captured from wave detail screen with grouping disabled
- **WHEN** the user captures a photo from a screen that provides a `waveUuid` context
- **AND** `grouping.enabled` is `false`
- **THEN** the photo SHALL be queued with that `waveUuid` unconditionally (preserving current behavior)
- **THEN** after upload, `addPhotoToWave` mutation is called to associate the photo with the wave
- **THEN** the upload bus SHALL emit `{ photo, waveUuid }` with the queue item's `waveUuid`

#### Scenario: Photo captured from main feed with grouping enabled
- **WHEN** the user captures a photo from the main feed (no `waveUuid` context)
- **AND** `grouping.enabled` is `true`
- **THEN** the system SHALL determine the `waveUuid` via the drift-check logic (check active wave, call `isLocationInWave`)
- **THEN** the resolved `waveUuid` (or `undefined` if drifted/no active wave) SHALL be passed to `enqueueCapture`

#### Scenario: Photo captured from main feed with grouping disabled
- **WHEN** the user captures a photo from the main feed (no `waveUuid` context)
- **AND** `grouping.enabled` is `false`
- **THEN** the photo is uploaded without any wave association
- **THEN** the upload bus SHALL emit `{ photo, waveUuid: undefined }`
