# Proposal

## Why

Video processing moves the queued source file before its staged path is durably recorded. If photo creation or the queue update is interrupted, recovery can see the original path as missing and mark the item unrecoverable even when the staged video still exists, leaving an inactive backend photo that cannot resume from the app.

## What Changes

- Persist the staged video path and processing state before making the backend photo-creation request.
- During recovery, recognize an already-staged video when the original source path has been moved, restore the queue item's usable paths, and resume the upload instead of classifying it as missing.
- Add regression coverage for interruption after staging and for a backend photo-creation request that times out after the record is created.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `upload-queue-recovery`: Require video staging state to survive interruptions and allow recovery to resume from the staged video file.

## Impact

- Affected client code: `src/screens/PhotosList/upload/photoUploadService.js` and `src/screens/PhotosList/upload/usePhotoUploader.js`.
- Affected tests: the upload service and queue orchestration tests.
- No GraphQL schema or backend changes are expected.
