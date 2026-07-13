## MODIFIED Requirements

### Requirement: Banner reads UploadContext and network state directly

The `GlobalUploadBanner` SHALL consume `UploadContext` and `STATE.netAvailable` directly. It SHALL NOT receive upload state as props from a parent screen. The banner SHALL read `STATE.netAvailable` via `useAtomValue` from the Jotai state module, NOT by destructuring it from `UploadContext`.

#### Scenario: Banner consumes context
- **WHEN** the banner renders
- **THEN** it SHALL call `useContext(UploadContext)` to get `pendingPhotos`, `isUploading`, and `clearPendingQueue`
- **THEN** it SHALL read `STATE.netAvailable` via `useAtomValue` from the Jotai state module

#### Scenario: Status label reflects network and upload state
- **WHEN** `pendingPhotos` is non-empty and `netAvailable` is `true` and `isUploading` is `true`
- **THEN** the status label SHALL display "uploading"
- **WHEN** `pendingPhotos` is non-empty and `netAvailable` is `true` and `isUploading` is `false`
- **THEN** the status label SHALL display "ready to upload"
- **WHEN** `pendingPhotos` is non-empty and `netAvailable` is `false`
- **THEN** the status label SHALL display "waiting to upload"

#### Scenario: Icon animation responds to network state
- **WHEN** `pendingPhotos` is non-empty and `netAvailable` is `true`
- **THEN** the upload icon SHALL pulse via `Animated.loop` animation
- **WHEN** `pendingPhotos` is non-empty and `netAvailable` is `false`
- **THEN** the upload icon SHALL NOT pulse and SHALL use the disabled color theme
