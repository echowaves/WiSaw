## Why

Auto-grouping has been moved server-side (see `2026-06-19-server-side-auto-grouping` change). The server now runs auto-grouping after every photo upload with a hardcoded grouping level of "CITY" (medium), and notifies clients via the `onPhotoUploadComplete` GraphQL subscription. The client still has leftover auto-grouping code, settings screens, and configuration UI that are no longer needed — removing them simplifies the client and eliminates redundant client-side grouping calls.

## What Changes

- **Remove** `app/grouping-settings.tsx` and `src/screens/GroupingSettings/index.js` — no longer needed since grouping level is always "CITY" on the server
- **Remove** grouping settings button from WavesHub header
- **Remove** `runAutoGroup`, `handleAutoGroup` functions and auto-group progress modal from WavesHub
- **Remove** `autoGroupBus` subscription for triggering auto-group from WavesHub (keep `subscribeToAutoGroupDone` for wave delete flow)
- **Remove** `flushUngroupedPhotos` call from `usePhotoUploader.js` and `photoUploadService.js`
- **Remove** `autoGroupPhotos` export from `src/screens/Waves/reducer.js`
- **Remove** `src/events/autoGroupRunningGuard.js` entirely
- **Simplify** `src/events/autoGroupBus.js` — remove `emitAutoGroup`, `subscribeToAutoGroup`, `emitAutoGroupSilent`; keep `subscribeToAutoGroupDone`/`emitAutoGroupDone`
- **Add** `directSubscriptionClient` subscription in WavesHub for `onPhotoUploadComplete` to refresh the waves feed after upload+grouping completes
- **Update** WavesExplainerView CTA — auto-group is now automatic, remove the trigger button

## Capabilities

### New Capabilities
<!-- No new capabilities — this is a cleanup/refactor change -->

### Modified Capabilities
- `photo-upload-orchestration`: Remove client-side auto-group trigger; feed refresh driven by `onPhotoUploadComplete` subscription notification instead
- `auto-group-settings`: Removed — grouping level is always "CITY" on server, no client configuration
- `auto-group-photos`: Client-side invocation removed; server handles all auto-grouping
- `auto-group-trigger`: Client-side trigger removed; auto-group triggered server-side after upload

## Impact

- **Affected code**:
  - `app/grouping-settings.tsx` (delete)
  - `src/screens/GroupingSettings/index.js` (delete)
  - `src/screens/WavesHub/index.js` (major cleanup + subscription addition)
  - `src/screens/PhotosList/upload/usePhotoUploader.js` (remove flushUngroupedPhotos)
  - `src/screens/PhotosList/upload/photoUploadService.js` (remove flushUngroupedPhotos)
  - `src/screens/Waves/reducer.js` (remove autoGroupPhotos)
  - `src/events/autoGroupRunningGuard.js` (delete)
  - `src/events/autoGroupBus.js` (simplify)
  - `src/components/WavesExplainerView/index.js` (update CTA)
- **APIs**: No API changes — subscription `onPhotoUploadComplete` already deployed server-side
- **Dependencies**: No new dependencies