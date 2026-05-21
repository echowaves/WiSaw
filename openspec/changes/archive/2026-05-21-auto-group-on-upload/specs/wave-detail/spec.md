## MODIFIED Requirements

### Requirement: Wave Detail Footer with Camera
The system SHALL display a `PhotosListFooter` at the bottom of the Wave Detail screen with camera, video, drawer, and friends buttons. Photos captured from this footer SHALL be tagged to the current wave ONLY if the photo's coordinates fall within the wave's geo-boundary when `grouping.enabled` is `true`. When `grouping.enabled` is `false`, photos SHALL be tagged to the viewed wave unconditionally (preserving current behavior). The `enqueueCapture` function SHALL be consumed from `UploadContext`.

#### Scenario: User takes a photo from wave detail with grouping enabled and photo fits
- **WHEN** the user taps the camera button in the wave detail footer
- **AND** `grouping.enabled` is `true`
- **AND** the photo's coordinates fall within the viewed wave's geo-boundary
- **THEN** `enqueueCapture` SHALL be called with the current wave's UUID attached
- **THEN** the captured photo is queued for upload with the wave UUID

#### Scenario: User takes a photo from wave detail with grouping enabled and photo drifted
- **WHEN** the user taps the camera button in the wave detail footer
- **AND** `grouping.enabled` is `true`
- **AND** the photo's coordinates do NOT fall within the viewed wave's geo-boundary
- **THEN** the wave UUID SHALL be dropped
- **THEN** the photo SHALL be uploaded as a regular ungrouped photo following the generic drift-check path
- **THEN** a toast SHALL inform the user that the photo was not added to the viewed wave due to location change

#### Scenario: User takes a photo from wave detail with grouping disabled
- **WHEN** the user taps the camera button in the wave detail footer
- **AND** `grouping.enabled` is `false`
- **THEN** `enqueueCapture` SHALL be called with the current wave's UUID attached unconditionally
- **THEN** the captured photo is queued for upload with the wave UUID

#### Scenario: User records a video from wave detail
- **WHEN** the user taps the video button in the wave detail footer
- **THEN** the same geo-boundary check logic SHALL apply as for photos
