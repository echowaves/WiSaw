## Purpose

This specification defines expected user-visible behavior, constraints, and validation scenarios for upload orchestration in WiSaw.

## MODIFIED Requirements

### Requirement: WavesHub consumes UploadContext for upload progress UI

WavesHub SHALL consume `UploadContext` for `enqueueCapture` (camera button). Upload progress UI SHALL be handled by the global `GlobalUploadBanner` — WavesHub SHALL NOT render `PendingPhotosBanner` or call `usePendingAnimation`.

#### Scenario: WavesHub consumes UploadContext for camera only
- **WHEN** the WavesHub screen mounts
- **THEN** the system SHALL call `useContext(UploadContext)` to access `enqueueCapture`
- **THEN** WavesHub SHALL NOT import or render `PendingPhotosBanner`
- **THEN** WavesHub SHALL NOT call `usePendingAnimation`

#### Scenario: Global banner shows upload status on WavesHub
- **WHEN** `pendingPhotos.length > 0` and WavesHub is the active drawer screen
- **THEN** the `GlobalUploadBanner` SHALL be visible (mounted at drawer level, independent of WavesHub)
- **THEN** WavesHub SHALL read `bannerHeightAtom` and apply padding above its AppHeader

#### Scenario: WavesHub ignores pending photos for layout
- **WHEN** pending uploads exist
- **THEN** WavesHub SHALL NOT adjust its layout for the upload banner
- **THEN** the global banner handles all upload indicator rendering
