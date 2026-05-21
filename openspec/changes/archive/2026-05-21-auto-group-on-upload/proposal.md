## Why

When auto-grouping is enabled, photos uploaded from non-wave screens (main feed, bookmarks) are never automatically added to a wave. They sit as "ungrouped" until the user physically moves to a new location and the drift-based trigger fires — which could be hours or never. The backend now provides `isLocationInWave` to check coordinates against a wave's geo-boundary, enabling the frontend to make smart upload-time routing decisions: upload directly to the active wave when nearby, or trigger auto-grouping when the user has drifted. Additionally, wave-screen uploads currently skip boundary checks, allowing photos taken far from a wave's location to be incorrectly added to that wave.

## What Changes

- Add **active wave tracking** on the frontend: query `isActive` from `listWaves`, persist the active wave UUID in AsyncStorage, and update it when `autoGroupPhotosIntoWaves` returns `isNewWave: true`
- Add **pre-upload drift check** using the new `isLocationInWave` GraphQL query: before enqueueing a photo, check if the user's coordinates fall within the target wave's geo-boundary
- When the photo **fits** the wave: upload with `waveUuid` (direct add, no auto-group needed)
- When the photo **drifts** from the wave: auto-group all existing ungrouped photos first (flushing them to the old wave), then upload the new photo as ungrouped, then auto-group immediately to create a new wave at the new location
- **Wave detail screen uploads** now also check boundaries: if the photo doesn't fit the viewed wave, it follows the generic ungrouped upload path instead of being force-added
- Show a **toast notification** when drift creates a new wave, explaining the location change
- **Fix**: gate the existing drift-based auto-trigger on `grouping.enabled` (currently ignored)

## Capabilities

### New Capabilities
- `active-wave-tracking`: Frontend persistence and state management for the user's current active wave (the wave receiving auto-grouped photos), synced with the backend's `isActive` flag
- `upload-drift-check`: Pre-upload geo-boundary check using `isLocationInWave` to determine whether a photo fits the current wave or has drifted, with orchestration of the auto-group-then-upload sequence

### Modified Capabilities
- `photo-upload`: Upload flow gains a pre-enqueue drift check step; `waveUuid` is now determined dynamically based on `isLocationInWave` result rather than being static per screen
- `wave-detail`: Camera uploads check wave boundaries; photos outside the viewed wave's geo-boundary are uploaded as ungrouped instead of being force-added
- `auto-group-trigger`: Drift-based trigger must respect `grouping.enabled`; becomes a fallback mechanism for offline/legacy ungrouped photos
- `auto-group-photos`: `autoGroupPhotosIntoWaves` result now drives active wave atom updates when `isNewWave: true`

## Impact

- **State**: New `activeWave` Jotai atom + AsyncStorage persistence (new file `activeWaveStorage.js`)
- **GraphQL**: Frontend adds `isLocationInWave` query call and adds `isActive` field to `listWaves` selection set
- **Upload flow**: `useCameraCapture` and WaveDetail camera gain async pre-enqueue logic (latency increase when auto-grouping is enabled)
- **Events**: `autoGroupBus` may carry new wave info for toast display
- **Screens affected**: PhotosList, WaveDetail, WavesHub (Waves list screen), UploadProvider
- **No new dependencies** required
