## Context

The upload queue lives in `src/screens/PhotosList/upload/` and is orchestrated by the `usePhotoUploader` hook. Items are persisted to `expo-storage` under `PENDING_UPLOADS_KEY`. Currently, each queue item carries `type`, `originalCameraUrl`, `localImageName`, and optional metadata but NO photo identifier until AFTER `generatePhoto()` succeeds on the server.

The current flow is:
1. Capture → `queueFileForUpload()` — no photoId
2. `processCompleteUpload()` → `generatePhoto()` (server creates photoId) → `uploadItem()` (S3 upload)
3. On timeout during `generatePhoto()`, client retries → calls `generatePhoto()` again → DUPLICATE

The `photoUploadService.js` file handles queue management, file processing, photo creation, and S3 upload. The `usePhotoUploader.js` hook orchestrates the queue loop with retry logic.

## Goals / Non-Goals

**Goals:**
- Each queue item gets a `photoId` (UUID v4) generated exactly once at queue entry time
- Retry logic uses the same `photoId` for all attempts — no duplicates
- Three-state upload flow: active → skip, inactive → S3 only, missing → create + S3
- Requires backend change to accept `photoId` as a required parameter on `createPhoto`

**Non-Goals:**
- Modifying the existing retry backoff logic (exponential backoff, pause after max failures)
- Changing the S3 upload protocol or asset key format
- Modifying the S3 trigger (`processUploadedImage` Lambda)
- Handling migration of existing queue items (old items without `photoId` will be ignored/created fresh)
- Adding a UI for manual queue management beyond existing mechanisms

## Decisions

### Decision 1: Client-side UUID v4 generation at queue entry

**Why**: The photoId must be stable across retries and app restarts. Generating it at queue entry time (in `queueFileForUpload()`) ensures it's assigned once before any server interaction.

**Approach**: Use `crypto.randomUUID()` (available in React Native 0.73+ / Expo 54). This is a hard requirement — every queue item MUST have a `photoId`.

```js
const photoId = crypto.randomUUID()

const image = {
  photoId,
  originalCameraUrl: cameraImgUrl,
  localImageName,
  type,
  localCacheKey,
  waveUuid,
  location
}
await addToQueue(image)
```

**Alternatives considered**:
- Server-side UUID generation: Fails because client has no way to deduplicate on retry. Rejected.
- Hash of file content: Would work for deduplication but adds complexity and requires reading the entire file. UUID is simpler.

### Decision 2: New `getPhotoById` GraphQL query

**Why**: The client needs to know the photo's state (active/inactive/not-found) before deciding which upload path to take. Current queries (`feedByDate`, `getPhotoDetails`) don't support lookup by arbitrary photoId.

**Approach**: Add a new query that accepts `photoId: String!` and returns `PhotoDetails`. The server controller queries `SELECT * FROM Photos WHERE id = $1`.

```graphql
query getPhotoById($photoId: String!) {
  getPhotoById(photoId: $photoId) {
    id
    uuid
    active
    imgUrl
    thumbUrl
    video
  }
}
```

**Alternatives considered**:
- Use existing `getPhotoDetails(photoId, uuid)`: Requires knowing the device uuid AND photoId. More complex, unnecessary.
- Query the feed for the photo: Fragile, doesn't work for photos not yet in feeds. Rejected.

### Decision 3: Three-state upload flow in `processCompleteUpload`

**Why**: After `getPhotoById(photoId)` returns, the client needs to branch into the correct upload path.

**Approach**: Restructure `processCompleteUpload()` to check photo state first:

```
processCompleteUpload(item):
  photoId = item.photoId   ← always present

  // Step 1: Check server state
  existing = await getPhotoById(photoId)

  if existing && existing.active:
    → State ACTIVE: remove from queue, return existing photo
  if existing && !existing.active:
    → State INACTIVE: skip createPhoto, upload S3 only
  if !existing:
    → State MISSING: createPhoto(photoId, ...) → upload S3
```

**Alternatives considered**:
- Always call createPhoto and rely on server-side duplicate detection: Adds unnecessary latency and database writes. Three-state flow is cleaner.
- Skip the existence check and always call createPhoto: Would require server to handle all duplicates, but no way to distinguish "active" from "inactive" states. Rejected.

### Decision 4: Backend `createPhoto` accepts optional photoId

**Why**: The backend change must be backward compatible — old clients that don't send `photoId` should continue to work. New clients that send `photoId` get deduplication benefits.

**Approach**: Add optional `photoId` parameter to `createPhoto`. When provided, use it as the primary key. If a photo with that ID already exists, return the existing photo (skip abuse check, skip creation). When not provided, generate server-side UUID (current behavior).

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| `crypto.randomUUID()` not available in current React Native version | Fallback to a simple UUID v4 generator using `Math.random()` |
| Backend deploys after client — old clients break | Backend change is backward compatible (optional photoId). Can deploy backend first. |
| Queue item size increases with photoId field | UUID is 36 characters — negligible for AsyncStorage |
| Race condition: two captures in rapid succession generate same UUID | Extremely unlikely (128-bit space). DB primary key constraint catches any collision. |
| S3 trigger processes photo before client finishes upload | S3 PUT is idempotent. Trigger only fires after successful PUT. |
| Existing queue items don't have photoId | These items are ignored. They remain in the queue but `getPhotoById` returns null, so a new photo with a fresh `photoId` will be created. Old items eventually get cleaned up by the health check (5-minute stale timeout). |

## Migration Plan

**Deployment order:**
1. Deploy backend change first (backward compatible)
2. Deploy client update

**Rollback:**
- If client update has issues: roll back client. Old clients continue using server-side UUID generation. No data loss — duplicate photos can be cleaned up manually.

## Open Questions

1. Should the backend skip the abuse check when returning an existing photo by photoId? (Current decision: yes, because the photo was already created and passed the abuse check at that time.)
2. Should we add a `createdAt` comparison to distinguish between "just created" vs "old photo from days ago"? (Current decision: no, the primary key constraint prevents duplicates regardless.)
