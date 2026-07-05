## ADDED Requirements

### Requirement: Generate photo UUID on queue entry
The system SHALL generate a UUID v4 as `photoId` for each queue item at the time of queue entry. This `photoId` is generated exactly once and persisted to the queue in AsyncStorage. It NEVER changes across retries, app restarts, or queue processing cycles.

#### Scenario: Photo UUID generated on queue entry
- **WHEN** a photo or video is captured and queued via `queueFileForUpload()`
- **THEN** the queue item includes a `photoId` field set to a newly generated UUID v4

#### Scenario: Photo UUID persists across app restarts
- **WHEN** the app restarts with pending items in the upload queue
- **THEN** the `photoId` field is restored from AsyncStorage and remains unchanged

#### Scenario: Photo UUID never changes on retry
- **WHEN** a queued item is retried due to upload failure
- **THEN** the same `photoId` value is used for all retry attempts

---

### Requirement: Check photo existence before creation
The system SHALL query the server to check whether a photo with the item's `photoId` already exists before attempting to create a new photo record. The query requires both `photoId` (the photo's UUID) and `uuid` (the device identifier) for ownership verification — the backend must confirm the calling device is the owner.

#### Scenario: Query photo by ID with ownership
- **WHEN** processing a queued item
- **THEN** the system calls `getPhotoById(photoId, uuid)` GraphQL query with both the photo's ID and the device identifier for ownership verification

#### Scenario: Photo not found on server
- **WHEN** `getPhotoById(photoId, uuid)` returns null (photo not owned by calling device, does not exist, or network error)
- **THEN** the system proceeds to create the photo via `createPhoto` mutation

---

### Requirement: Three-state upload flow
The system SHALL handle queued items through three states based on the photo's current state on the server:

1. **Active** — photo exists, is active, AND is owned by the calling device: skip upload, remove from queue
2. **Not active** — photo exists but S3 upload failed: upload S3 files only, no new `createPhoto` call
3. **Not found** — photo does not exist OR not owned by calling device: create photo, then upload S3 files

#### Scenario: Active photo skips upload
- **WHEN** `getPhotoById(photoId, uuid)` returns a photo with `active: true` AND the `uuid` matches the photo's owner
- **THEN** the system removes the item from the queue and emits `uploadComplete` with the existing photo data
- **AND** no `createPhoto` or S3 upload is performed

#### Scenario: Inactive photo uploads S3 only
- **WHEN** `getPhotoById(photoId, uuid)` returns a photo with `active: false` AND the `uuid` matches the photo's owner
- **THEN** the system skips `createPhoto` and proceeds directly to S3 upload using the known `photoId`
- **AND** after successful S3 upload, the item is removed from the queue

#### Scenario: Photo not owned by caller returns null
- **WHEN** `getPhotoById(photoId, uuid)` is called with a `uuid` that does NOT match the photo's owner
- **THEN** the server rejects the query and returns null (or an authorization error)
- **AND** the client treats this as "not found" and proceeds to create a new photo

#### Scenario: Missing photo creates then uploads
- **WHEN** `getPhotoById(photoId, uuid)` returns null (photo not owned by calling device, does not exist, or network error)
- **THEN** the system calls `createPhoto` mutation with the pre-generated `photoId` parameter
- **AND** after successful photo creation, proceeds to S3 upload
- **AND** after successful S3 upload, the item is removed from the queue

---

### Requirement: Idempotent photo creation
The system SHALL pass the client-generated `photoId` to the `createPhoto` mutation. The server MUST use this value as the photo's primary key and return the existing photo if one with that ID already exists.

#### Scenario: Client passes photoId to createPhoto
- **WHEN** the system calls `createPhoto` mutation
- **THEN** the mutation includes the `photoId` parameter with the client-generated UUID

#### Scenario: Duplicate photoId returns existing photo
- **WHEN** `createPhoto` is called with a `photoId` that already exists in the database
- **THEN** the server returns the existing photo record without creating a duplicate
- **AND** the abuse report check is skipped for idempotent returns

---

### Requirement: Queue item structure includes photoId
The queue item stored in AsyncStorage SHALL include the `photoId` field alongside existing fields (`originalCameraUrl`, `localImageName`, `type`, `localCacheKey`, `waveUuid`, `location`).

#### Scenario: Queue item has photoId field
- **WHEN** an item is added to the upload queue
- **THEN** the queue item contains a `photoId` field with a valid UUID v4 string

#### Scenario: Queue item retains all original fields
- **WHEN** an item is added to the upload queue
- **THEN** the queue item contains all original fields: `originalCameraUrl`, `localImageName`, `type`, `localCacheKey`, `waveUuid`, `location`, plus the new `photoId` field
