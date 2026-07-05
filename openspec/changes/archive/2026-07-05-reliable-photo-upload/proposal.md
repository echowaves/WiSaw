## Why

The photo/video upload system is unreliable on flaky connections. When network timeouts occur during `createPhoto`, the client retries without knowing whether the server already created the photo record — resulting in duplicate photos in the database and stuck upload queues. The current system has no idempotency guarantee.

## What Changes

- **Client-side photo UUID generation**: Each queue item gets a `photoId` (UUID v4) generated once at queue entry time. This UUID becomes the stable, deduplicated identity for the photo across retries.
- **Three-state upload flow**: `processCompleteUpload` checks if a photo already exists on the server before attempting creation:
  - If `active` → skip upload entirely, remove from queue
  - If `!active` → upload S3 files only (photo was created but S3 upload failed)
  - If not found → call `createPhoto` with the pre-generated `photoId`
- **Idempotent photo creation**: `createPhoto` mutation requires `photoId` parameter (client-provided UUID v4). The primary key constraint on `Photos.id` provides the hard deduplication guarantee. Duplicate attempts return the existing photo.
- **New `getPhotoById` query**: Allows the client to check a photo's existence and `active` state before deciding which upload path to take.
- **Queue items persist `photoId`**: The UUID survives app restarts and retries in AsyncStorage.

## Capabilities

### New Capabilities
- `photo-upload-dedup`: Client-side photo UUID generation and three-state upload flow (check → create → upload) for idempotent retries

### Modified Capabilities
- `photo-upload`: `createPhoto` mutation now accepts `photoId` parameter; adds `getPhotoById` query

## Impact

**Client code:**
- `src/screens/PhotosList/upload/photoUploadService.js` — queue item structure, `generatePhoto`, `uploadItem`, `processCompleteUpload`
- `src/screens/PhotosList/upload/usePhotoUploader.js` — hook unchanged externally, internal flow modified
- `src/screens/PhotosList/upload/` — new `getPhotoById` GraphQL query

**Backend code (Wisaw.cdk):**
- `graphql/schema.graphql` — modify `createPhoto` mutation, add `getPhotoById` query
- `lambda-fns/controllers/photos/create.ts` — accept client-provided `photoId`
- `lambda-fns/controllers/photos/getPhotoById.ts` — new controller

**Deployment:** Client and backend must be deployed together (atomic change).
