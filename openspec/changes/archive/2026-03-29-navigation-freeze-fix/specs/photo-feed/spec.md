## MODIFIED Requirements

### Requirement: Photo feed state management
The PhotosList screen SHALL store its photo array in screen-local state (`useState`) rather than a global Jotai atom. Photos SHALL be frozen via `createFrozenPhoto` at write boundaries (fetch and upload callbacks). The screen SHALL provide a `PhotosListContext` with a `removePhoto` function that filters the local state, consistent with WaveDetail's pattern. Upload state (`pendingPhotos`, `isUploading`, `enqueueCapture`, `clearPendingQueue`) SHALL be consumed from `UploadContext` instead of instantiating a local `usePhotoUploader`. Upload completions SHALL be received via the upload bus subscription. The screen SHALL subscribe to the `photoDeletionBus` and remove matching photos from its local state when a deletion event is received from another screen. The screen SHALL maintain an `AbortController` ref to cancel in-flight `reload()`/`load()` async chains when a new segment switch occurs or when the screen loses focus. All `setState` calls within async `load()`/`reload()` functions SHALL check `signal.aborted` before executing. The `pageNumber` useEffect SHALL be removed; pagination SHALL trigger `load()` explicitly from the pagination call site.

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
- **WHEN** a `photoDeletionBus` event is emitted with a photo ID
- **THEN** the PhotosList SHALL remove the matching photo from its local `useState` array

#### Scenario: Segment switch cancels in-flight loads
- **WHEN** the user taps a different segment while a `reload()` or `load()` chain is in flight
- **THEN** the previous AbortController SHALL be aborted
- **THEN** a new AbortController SHALL be created for the new reload chain
- **THEN** all `setState` calls from the aborted chain SHALL be skipped

#### Scenario: Screen blur cancels in-flight loads
- **WHEN** the user navigates away from PhotosList (e.g., to Waves via drawer or header icon)
- **THEN** the current AbortController SHALL be aborted
- **THEN** no further `setState` calls from the in-flight chain SHALL execute

#### Scenario: Pagination triggers load explicitly
- **WHEN** the masonry grid reaches the end threshold and more data is available
- **THEN** `setPageNumber` SHALL be called with the next page number
- **THEN** `load()` SHALL be called explicitly from the same handler
- **THEN** no `useEffect` watching `pageNumber` SHALL exist
