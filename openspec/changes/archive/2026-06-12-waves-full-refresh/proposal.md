## Why

WavesHub does not reload the waves list after key mutation events (auto-group completion, photo upload). Users see stale wave data — missing newly created waves, outdated photo thumbnails, incorrect counts — until they navigate away and back. The screen should reflect changes immediately or near-immediately.

## What Changes

- **Auto-group completion**: After auto-group finishes, call `handleRefresh()` to perform a full waves list reload (fresh waves, photos, counts) instead of only updating badge counts.
- **Photo upload without waveUuid**: When an ungrouped photo finishes uploading, append its thumb to the local ungrouped photos state (local `setUngroupedPhotosCount` increment), same pattern as PhotosList — no full refresh.
- **Photo upload with waveUuid**: When a photo finishes uploading to a known wave, prepend its thumb to that wave's thumbnail list in local state, same pattern as WaveDetail — no full refresh.

## Capabilities

### Modified Capabilities
- `wave-hub`: Refresh behavior after auto-group, upload-complete, and create-wave events

## Impact

- `src/screens/WavesHub/index.js` — Modify event subscriptions (auto-group-done, upload-complete), add local state updates for ungrouped and wave photo thumbs
- No backend changes — `listWaves` already uses `fetchPolicy: 'network-only'`
