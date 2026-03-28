## MODIFIED Requirements

### Requirement: Photo feed state management
The PhotosList screen SHALL store its photo array in screen-local state (`useState`) rather than a global Jotai atom. Photos SHALL be frozen via `createFrozenPhoto` at write boundaries (fetch and upload callbacks). The screen SHALL provide a `PhotosListContext` with a `removePhoto` function that filters the local state, consistent with WaveDetail's pattern. Upload state (`pendingPhotos`, `isUploading`, `enqueueCapture`, `clearPendingQueue`) SHALL be consumed from `UploadContext` instead of instantiating a local `usePhotoUploader`. Upload completions SHALL be received via the upload bus subscription. The screen SHALL subscribe to the `photoDeletionBus` and remove matching photos from its local state when a deletion event is received from another screen. All React hooks SHALL be declared before any conditional early returns to satisfy the Rules of Hooks.

#### Scenario: PhotosList initializes with empty local state
- **WHEN** the PhotosList screen mounts
- **THEN** the photo array SHALL be initialized as an empty array via `useState([])`
- **THEN** no global Jotai atom SHALL be used for the photo list

#### Scenario: Fetched photos are frozen at write boundary
- **WHEN** photos are fetched from the API
- **THEN** each photo SHALL be passed through `createFrozenPhoto` before being stored in local state

#### Scenario: Uploaded photo is frozen at write boundary
- **WHEN** the upload bus emits a successful upload event
- **THEN** the uploaded photo SHALL be passed through `createFrozenPhoto` before being prepended to local state

#### Scenario: Photo deleted from expanded view updates local state
- **WHEN** a photo is deleted from within the expanded `Photo` component
- **THEN** `removePhoto` from `PhotosListContext` SHALL filter the photo from the local `useState` array
- **THEN** the masonry grid SHALL re-render without the deleted photo

#### Scenario: Upload state consumed from context
- **WHEN** PhotosList needs `pendingPhotos`, `isUploading`, `enqueueCapture`, or `clearPendingQueue`
- **THEN** it SHALL consume them from `UploadContext` via `useContext`
- **THEN** it SHALL NOT instantiate its own `usePhotoUploader`

#### Scenario: Cross-screen photo deletion received
- **WHEN** the `photoDeletionBus` emits `{ photoId }`
- **THEN** the PhotosList screen SHALL remove the photo with that ID from its local state
- **THEN** the masonry grid SHALL re-render without the deleted photo

#### Scenario: Deletion bus subscription cleanup
- **WHEN** the PhotosList screen unmounts
- **THEN** the `photoDeletionBus` subscription SHALL be cleaned up via the `useEffect` return function

#### Scenario: Hooks execute before conditional returns
- **WHEN** the PhotosList component renders with `netAvailable` equal to `false`
- **THEN** all hooks including `useCallback(removePhoto)` and `useMemo(photosListContextValue)` SHALL have already been called before the early return
- **THEN** the component SHALL NOT crash with a "fewer hooks than expected" error
