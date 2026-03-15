## Why

The Waves Hub screen lacks an auto-group button in the header, forcing users to discover auto-grouping only through the old Waves list screen. Additionally, the wave photo count displayed on WaveCard is incorrect — it uses `wave.photos.length` (counting the `photos: [String]` array which may be truncated or incomplete) instead of the dedicated `photosCount: Int` field available in the GraphQL schema.

## What Changes

- Add an **Auto-Group button** to the upper-right header of the Waves screen (both `waves.tsx` and `waves-hub.tsx` routes), showing a badge with the count of ungrouped photos fetched via the existing `getUngroupedPhotosCount` GraphQL query
- Switch wave photo count display to use the `photosCount` field from the GraphQL `Wave` type, replacing the unreliable `photos.length` approach
- Add `getUngroupedPhotosCount` query to the waves reducer
- Add `photosCount` to the `listWaves` GraphQL query fields
- Remove the `photos` field from the `listWaves` query since `photosCount` replaces its counting purpose

## Capabilities

### New Capabilities
- `waves-auto-group-header`: Auto-group button in the waves header nav bar with ungrouped photo count badge

### Modified Capabilities
- `wave-photo-count`: Wave card and hub display accurate photo count from `photosCount` GraphQL field instead of `photos.length`

## Impact

- **Files modified**: `app/(drawer)/waves.tsx`, `app/(drawer)/waves-hub.tsx`, `src/screens/Waves/reducer.js`, `src/screens/WavesHub/reducer.js`, `src/screens/WavesHub/index.js`, `src/components/WaveCard/index.js`
- **GraphQL queries**: `listWaves` gains `photosCount` field, drops `photos` array; new `getUngroupedPhotosCount` query added
- **No new dependencies** required
