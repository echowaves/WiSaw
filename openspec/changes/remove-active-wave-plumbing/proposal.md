## Why

The backend has removed the `isActive` field from the Wave GraphQL type and replaced the "single active wave" grouping model with a "find matching existing wave" approach. The frontend still requests `isActive` in `listWaves`, stores active wave state in SecureStore, and uses it for upload-time wave assignment — all of which is now broken or redundant. The app currently crashes with `Field 'isActive' in type 'Wave' is undefined`.

## What Changes

- **BREAKING**: Remove `isActive` from the `listWaves` GraphQL query (fixes the crash)
- Remove `activeWaveAtom` from Jotai state
- Remove `activeWaveStorage.js` (SecureStore persistence for active wave)
- Remove active wave hydration from app startup (`_layout.tsx`)
- Remove active wave sync from `listWaves` refresh in WavesHub
- Remove `checkAndAssignWave` function (client-side wave matching using active wave) from `photoUploadService.js`
- Remove active wave save/clear calls from upload flow and auto-group flow
- Remove active wave cleanup on wave deletion in WavesHub
- Remove `upload-drift-check` logic that depends on active wave for `isLocationInWave` checks

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `active-wave-tracking`: **Entire capability removed** — no longer needed since backend dynamically finds matching waves
- `upload-wave-assignment`: Remove active wave dependency — photos upload as ungrouped and get assigned by backend auto-grouping
- `upload-drift-check`: **Entire capability removed** — drift detection was based on active wave which no longer exists
- `wave-hub`: Remove active wave sync from refresh, remove active wave update after auto-group, remove active wave clear on delete
- `auto-group-photos`: Remove active wave update after auto-group completes
- `wave-graphql-operations`: Remove `isActive` field from `listWaves` query

## Impact

- **Files removed**: `src/utils/activeWaveStorage.js`
- **Files modified**: `src/state.js`, `app/_layout.tsx`, `src/screens/WavesHub/index.js`, `src/screens/PhotosList/upload/photoUploadService.js`, `src/screens/Waves/reducer.js`
- **GraphQL**: `listWaves` query field list changes (removes `isActive`)
- **Storage**: `@activeWave` key in SecureStore becomes unused
- **No backend changes needed** — this aligns frontend with already-made backend changes
