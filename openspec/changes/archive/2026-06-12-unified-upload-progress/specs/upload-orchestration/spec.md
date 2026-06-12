## ADDED Requirements

### Requirement: WavesHub consumes UploadContext for upload progress UI
WavesHub SHALL consume `UploadContext` to access `pendingPhotos`, `isUploading`, and `clearPendingQueue` for rendering upload progress. WavesHub SHALL use the `usePendingAnimation` hook to derive `pendingPhotosAnimation` and `uploadIconAnimation` for consistent entrance and pulse animations.

#### Scenario: WavesHub consumes UploadContext
- **WHEN** the WavesHub screen mounts
- **THEN** the system SHALL call `useContext(UploadContext)` to access `pendingPhotos`, `isUploading`, and `clearPendingQueue`
- **THEN** no other screen besides PhotosList, WaveDetail, and WavesHub SHALL consume UploadContext

#### Scenario: WavesHub uses usePendingAnimation hook
- **WHEN** the WavesHub screen renders
- **THEN** it SHALL call `usePendingAnimation({ pendingPhotosCount: pendingPhotos.length, netAvailable })`
- **THEN** it SHALL pass `pendingPhotosAnimation` and `uploadIconAnimation` to `PendingPhotosBanner`

#### Scenario: WavesHub renders PendingPhotosBanner when uploads pending
- **WHEN** `pendingPhotos.length > 0`
- **THEN** WavesHub SHALL render `PendingPhotosBanner` between the `AppHeader` and `InteractionHintBanner`
- **THEN** the banner SHALL show the upload count, status label, and `LinearProgress` bar

#### Scenario: WavesHub hides PendingPhotosBanner when no uploads pending
- **WHEN** `pendingPhotos.length === 0`
- **THEN** `PendingPhotosBanner` SHALL return null and take no space
