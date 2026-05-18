## Why

Users currently must manually tap "Auto Group" to organize ungrouped photos into waves. After taking photos at different locations across a day, they expect the app to automatically group them when they notice the location has changed significantly. Manual triggering is friction — the app should group photos proactively when the user moves to a new location.

## What Changes

- **Location drift detection**: When the app resumes to foreground (or on periodic check), compare current GPS coordinates with the last auto-group trigger location. If drift exceeds the configured granularity threshold, automatically trigger `autoGroupPhotosIntoWaves`.
- **Granularity settings UI**: Add a new "Grouping Granularity" section to settings where users can choose how tightly photos cluster: Near (10km/DISTRICT), Medium (50km/CITY, default), Far (250km/REGION), or World (1000km/COUNTRY).
- **Progress overlay**: Show an in-place progress indicator during auto-grouping (photos grouped count, waves created count).
- **Persistence**: Store `lastTriggerLocation`, `groupingGranularity`, and `autoGroupEnabled` (toggle ON/OFF) in AsyncStorage, synced to Jotai atoms.
- **No client-side clustering**: The server already handles clustering via `autoGroupPhotosIntoWaves` mutation. The client only decides WHEN to trigger.

## Capabilities

### New Capabilities

- `auto-group-trigger`: Client-side location drift detection and automatic triggering of server-side photo grouping

### Modified Capabilities

<!-- None — no existing spec-level requirements are changing -->

## Impact

- **Modified files**: `src/screens/WavesHub/index.js` (add auto-trigger listener, progress overlay), `src/hooks/useLocationProvider.js` (expose last trigger location), new settings UI
- **New files**: `src/hooks/useLocationDrift.js` (drift detection hook), `src/utils/locationStorage.js` (persist last trigger location), `src/utils/groupingStorage.js` (persist granularity + toggle), `src/utils/haversine.js` (distance utility)
- **Server**: No changes needed — `autoGroupPhotosIntoWaves` mutation already handles clustering, reverse geocoding, and wave naming
- **Dependencies**: Uses existing `expo-location` (already in use), `@react-native-async-storage/async-storage` (check if already installed)
- **User-visible**: New settings section for granularity, progress overlay during auto-grouping, toast notifications
