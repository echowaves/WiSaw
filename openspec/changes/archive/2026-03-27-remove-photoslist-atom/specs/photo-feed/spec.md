## MODIFIED Requirements

### Requirement: Photo feed state management
The PhotosList screen SHALL store its photo array in screen-local state (`useState`) rather than a global Jotai atom. Photos SHALL be frozen via `createFrozenPhoto` at write boundaries (fetch and upload callbacks). The screen SHALL provide a `PhotosListContext` with a `removePhoto` function that filters the local state, consistent with WaveDetail's pattern.

#### Scenario: PhotosList initializes with empty local state
- **WHEN** the PhotosList screen mounts
- **THEN** the photo array SHALL be initialized as an empty array via `useState([])`
- **THEN** no global Jotai atom SHALL be used for the photo list

#### Scenario: Fetched photos are frozen at write boundary
- **WHEN** photos are fetched from the API
- **THEN** each photo SHALL be passed through `createFrozenPhoto` before being stored in local state

#### Scenario: Uploaded photo is frozen at write boundary
- **WHEN** a photo is uploaded successfully
- **THEN** the uploaded photo SHALL be passed through `createFrozenPhoto` before being prepended to local state

#### Scenario: Photo deleted from expanded view updates local state
- **WHEN** a photo is deleted from within the expanded `Photo` component
- **THEN** `removePhoto` from `PhotosListContext` SHALL filter the photo from the local `useState` array
- **THEN** the masonry grid SHALL re-render without the deleted photo
