## MODIFIED Requirements

### Requirement: Centralized upload provider

The system SHALL provide an `UploadProvider` component that owns the single `usePhotoUploader` instance. The provider SHALL be placed in the Drawer layout (`app/(drawer)/_layout.tsx`) so it wraps both `(tabs)` and `waves` navigation sections.

#### Scenario: Provider initializes uploader
- **WHEN** the Drawer layout mounts
- **THEN** `UploadProvider` SHALL instantiate `usePhotoUploader` with the current `uuid`, `setUuid`, `netAvailable`, and `topOffset`
- **THEN** no other screen SHALL instantiate its own `usePhotoUploader`

#### Scenario: Provider exposes upload context
- **WHEN** a descendant screen needs upload functionality
- **THEN** it SHALL consume `UploadContext` to access `enqueueCapture`, `pendingPhotos`, `isUploading`, `clearPendingQueue`, `isPaused`, `activeUploadId`, `pauseUploads`, `resumeUploads`, and `removePendingItem`

#### Scenario: Provider tracks network availability
- **WHEN** the device network state changes
- **THEN** the provider SHALL update its `netAvailable` state via a `NetInfo` listener
- **THEN** the uploader SHALL react to connectivity changes (retry on reconnect)
- **THEN** a network recovery SHALL NOT re-drive the queue while `isPaused` is `true`
