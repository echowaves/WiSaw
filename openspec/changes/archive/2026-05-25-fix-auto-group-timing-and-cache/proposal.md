## Why

Auto-grouping after photo upload has a timing bug: `flushUngroupedPhotos` runs *before* each photo is created on the server, so it never groups the current photo. The last photo in a batch is never grouped at all because no subsequent upload triggers a flush. Additionally, the WavesHub screen uses Apollo's default `cache-first` fetch policy for `listWaves`, `getUngroupedPhotosCount`, and `getWavesCount`, so navigating to the Waves screen shows stale data even after auto-grouping ran.

## What Changes

- Remove the per-photo `flushUngroupedPhotos` call from `processCompleteUpload` — it runs at the wrong time and wastes API calls
- Add a single `flushUngroupedPhotos` call in `usePhotoUploader` after the upload queue is fully drained, with a 5-second delay to let the backend process the last upload
- Add `fetchPolicy: 'network-only'` to `listWaves`, `getUngroupedPhotosCount`, and `getWavesCount` queries so the Waves screen always shows fresh data

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `upload-wave-assignment`: The "flush ungrouped photos before upload" requirement changes to "flush ungrouped photos after all uploads complete"
- `wave-graphql-operations`: `listWaves`, `getUngroupedPhotosCount`, and `getWavesCount` queries change from cache-first to network-only fetch policy

## Impact

- **Files modified**: `src/screens/PhotosList/upload/photoUploadService.js`, `src/screens/PhotosList/upload/usePhotoUploader.js`, `src/screens/Waves/reducer.js`
- **Behavior change**: Auto-grouping now fires once after all uploads complete (with 5s delay) instead of before each upload
- **Network**: Waves screen makes fresh network requests on every visit instead of serving Apollo cache; eliminates N per-photo auto-group API calls during batch upload
