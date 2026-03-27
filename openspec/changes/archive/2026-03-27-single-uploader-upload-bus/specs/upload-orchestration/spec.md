## ADDED Requirements

### Requirement: Upload event bus
The system SHALL provide an upload event bus (`src/events/uploadBus.js`) following the existing Set-based listener pattern. The bus SHALL emit `{ photo, waveUuid }` on each successful upload completion.

#### Scenario: Upload completes successfully
- **WHEN** `processCompleteUpload` returns a photo object for a queue item
- **THEN** `emitUploadComplete({ photo, waveUuid })` SHALL be called with the photo and the queue item's `waveUuid` (which may be `undefined` for main-feed photos)

#### Scenario: Upload fails
- **WHEN** `processCompleteUpload` returns `null`
- **THEN** no event SHALL be emitted to the upload bus

#### Scenario: Screen subscribes to upload completions
- **WHEN** a screen calls `subscribeToUploadComplete(listener)`
- **THEN** the listener SHALL be added to the listeners set
- **THEN** the returned function SHALL remove the listener when called

### Requirement: Centralized upload provider
The system SHALL provide an `UploadProvider` component that owns the single `usePhotoUploader` instance. The provider SHALL be placed in the Drawer layout (`app/(drawer)/_layout.tsx`) so it wraps both `(tabs)` and `waves` navigation sections.

#### Scenario: Provider initializes uploader
- **WHEN** the Drawer layout mounts
- **THEN** `UploadProvider` SHALL instantiate `usePhotoUploader` with the current `uuid`, `setUuid`, `netAvailable`, and `topOffset`
- **THEN** no other screen SHALL instantiate its own `usePhotoUploader`

#### Scenario: Provider exposes upload context
- **WHEN** a descendant screen needs upload functionality
- **THEN** it SHALL consume `UploadContext` to access `enqueueCapture`, `pendingPhotos`, `isUploading`, and `clearPendingQueue`

#### Scenario: Provider tracks network availability
- **WHEN** the device network state changes
- **THEN** the provider SHALL update its `netAvailable` state via a `NetInfo` listener
- **THEN** the uploader SHALL react to connectivity changes (retry on reconnect)

### Requirement: Upload hook emits to bus instead of callback
The `usePhotoUploader` hook SHALL emit upload completions to the upload bus instead of calling an `onPhotoUploaded` callback parameter. The hook SHALL read `waveUuid` from the current queue item and include it in the emitted event.

#### Scenario: Successful upload emits to bus
- **WHEN** `processCompleteUpload` returns an `uploadedPhoto` for `currentItem`
- **THEN** the hook SHALL call `emitUploadComplete({ photo: uploadedPhoto, waveUuid: currentItem.waveUuid })` instead of `onPhotoUploaded(uploadedPhoto)`

#### Scenario: Hook no longer accepts onPhotoUploaded
- **WHEN** `usePhotoUploader` is instantiated
- **THEN** the `onPhotoUploaded` parameter SHALL NOT be required or used

### Requirement: PhotosList upload bus subscription
PhotosList SHALL subscribe to the upload bus to receive upload completion events. All uploaded photos SHALL be prepended to the local state regardless of `waveUuid`.

#### Scenario: Photo uploaded from main feed
- **WHEN** the upload bus emits `{ photo, waveUuid: undefined }`
- **THEN** PhotosList SHALL prepend the photo (via `createFrozenPhoto`) to its local `useState` array with deduplication

#### Scenario: Photo uploaded from wave detail
- **WHEN** the upload bus emits `{ photo, waveUuid: "abc-123" }`
- **THEN** PhotosList SHALL still prepend the photo to its local state (the main feed shows all nearby photos)

#### Scenario: PhotosList unmounted during upload
- **WHEN** PhotosList is not mounted when an upload completes
- **THEN** the event is missed
- **THEN** when PhotosList next mounts, its `load()` function SHALL fetch fresh data from the server, catching up

### Requirement: WaveDetail upload bus subscription
WaveDetail SHALL subscribe to the upload bus to receive upload completion events. Only photos matching the current wave's UUID SHALL be prepended to the local state.

#### Scenario: Photo uploaded for matching wave
- **WHEN** the upload bus emits `{ photo, waveUuid }` and `waveUuid` equals the current wave's `waveUuid` from route params
- **THEN** WaveDetail SHALL prepend the photo (via `createFrozenPhoto`) to its local `photos` state with deduplication

#### Scenario: Photo uploaded for different wave
- **WHEN** the upload bus emits `{ photo, waveUuid }` and `waveUuid` does NOT match the current wave's `waveUuid`
- **THEN** WaveDetail SHALL NOT modify its local photo list

#### Scenario: Photo uploaded without wave association
- **WHEN** the upload bus emits `{ photo, waveUuid: undefined }`
- **THEN** WaveDetail SHALL NOT modify its local photo list

#### Scenario: WaveDetail unmounted during upload
- **WHEN** WaveDetail is not mounted when a matching upload completes
- **THEN** the event is missed
- **THEN** when WaveDetail next mounts, its `loadPhotos()` function SHALL fetch fresh data from the server, catching up
