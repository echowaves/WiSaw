## Why

The waves feature currently uses an "upload target" concept where users must explicitly set a wave as the upload target before taking photos. This adds cognitive overhead — users forget which wave is active, badges clutter the UI, and the main feed segments are unnecessarily coupled to wave filtering. The wave detail screen also lacks the rich interactions (expand, comments, action buttons) available in the main feed, making it a second-class experience.

## What Changes

- **Remove the upload target concept entirely**: No more `uploadTargetWave` atom, no badge indicators on the header icon, drawer, or footer nav button, no upload target bar on the Waves Hub
- **Decouple main feed segments from wave filtering**: The 3 feed segments (Global, Starred, Search) operate without any wave parameter — they always show the full feed
- **Remove the `activeWave` atom**: The deprecated atom and all its usage are removed
- **Redesign WaveDetail as a full-featured photo browsing screen**: Reuse `PhotosListMasonry`, `ExpandableThumb` (with comments), `PendingPhotosBanner`, `PhotosListFooter`, and `QuickActionsModalWrapper` — matching the starred photos layout with full interaction parity
- **Add contextual wave uploads via footer**: `PhotosListFooter` accepts an optional `waveUuid` prop; when present, camera captures are tagged to that wave. When on the main feed, no wave is attached
- **Use the new `feedForWave` GraphQL query**: WaveDetail fetches its photos via the dedicated `feedForWave` query instead of `feedForWatcher` with a waveUuid parameter
- **Remove the `waveUuid` parameter from `feedForWatcher`**: The main feed query no longer accepts wave filtering — that responsibility moves to `feedForWave`
- **Simplify WavesHub header**: Remove the upload target bar; keep the auto-group button

## Capabilities

### New Capabilities

### Modified Capabilities
- `wave-detail`: Redesigned to use starred-layout masonry with full interaction parity (expand/collapse, comments, AI tags, action buttons, long-press quick actions), contextual footer with camera uploading to the wave, and pending photos banner
- `wave-hub`: Remove upload target bar display and upload target management from Waves Hub
- `wave-header-icon`: Remove upload target badge indicator and long-press upload target toast — icon becomes a simple navigation button to Waves Hub
- `photo-upload`: Remove `uploadTargetWave`-based wave tagging; camera uploads are tagged to a wave only when a `waveUuid` is provided by the screen context (e.g., WaveDetail footer)
- `photo-feed`: Remove `activeWave` wave filtering from the main feed segments; `feedForWatcher` no longer accepts `waveUuid`

## Impact

- `src/state.js`: Remove `activeWave` and `uploadTargetWave` atoms
- `src/utils/waveStorage.js`: Remove upload target persistence functions
- `app/_layout.tsx`: Remove upload target initialization from app startup
- `app/(drawer)/_layout.tsx`: Remove upload target badge and subtitle from drawer Waves item
- `src/components/WaveHeaderIcon/index.js`: Remove badge, color tinting, and long-press handler
- `src/screens/PhotosList/components/PhotosListFooter.js`: Remove `hasUploadTarget` badge; add optional `waveUuid` prop for contextual uploads
- `src/screens/PhotosList/index.js`: Remove `activeWave` atom usage, remove wave parameter from `load()` calls
- `src/screens/PhotosList/reducer.js`: Remove `FEED_FOR_WATCHER_WITH_WAVE_QUERY` and `waveUuid` from `getPhotos()`
- `src/screens/WavesHub/index.js`: Remove upload target bar and `handleSetUploadTarget`
- `src/screens/WaveDetail/index.js`: Full redesign — reuse `PhotosListMasonry`, `ExpandableThumb`, `PhotosListFooter`, `PendingPhotosBanner`, `QuickActionsModalWrapper`
- `src/screens/WaveDetail/reducer.js`: Switch from `feedForWatcher` to new `feedForWave` query
- `app/(drawer)/wave-detail.tsx`: Update route to support redesigned screen
