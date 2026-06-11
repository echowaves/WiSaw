## Why

Auto-group overlay appears sporadically on the Waves screen, after which the app freezes and requires a full restart. Diagnostic logging reveals multiple 5-second flush timers are scheduled when the upload queue drains repeatedly (via pull-to-refresh, navigation back, location changes), causing concurrent `flushUngroupedPhotos()` calls that race against each other.

## What Changes

- Simplify `usePhotoUploader.js` flush logic to a single `needsFlushRef` flag: set true when upload batch starts (queue has items), schedule flush in `finally` block if flag is set, then reset. This eliminates duplicate flush timers and prevents flush on empty queues.
- Add an `autoGroupRunningRef` guard in `WavesHub/index.js` to prevent concurrent `runAutoGroup()` execution when multiple auto-group events fire simultaneously.

## Capabilities

### New Capabilities

- `photo-upload-orchestration`: Prevent concurrent auto-group flush scheduling after upload queue drains.

### Modified Capabilities

<!-- None — this is a new requirement, not a modification of existing spec behavior. -->

## Impact

- Two file changes:
  - `src/screens/PhotosList/upload/usePhotoUploader.js` (~12 lines added)
  - `src/screens/WavesHub/index.js` (~5 lines added)
- No API, dependency, or architectural changes
- No user-visible behavior changes (fixes sporadic freeze)
