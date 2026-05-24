## Why

The auto-group progress overlay shows a wave count that is far lower than the actual number of waves created. When processing many ungrouped photos, each API call can create multiple waves internally (the backend processes up to 200 photos per batch), but the frontend only sees one `waveUuid` returned per call and counts it as a single wave. This makes users think grouping is progressing slowly when it's actually creating waves much faster than displayed — e.g., showing "15 waves" while ~150 waves were created.

## What Changes

- **Frontend**: Replace the Set-based `waveUuidSet.size` counting with an accumulated `wavesCreated` counter that reads from the new `wavesCreated` field in the API response
- **API contract update**: The `autoGroupPhotosIntoWaves` mutation now returns a `wavesCreated: Int!` field indicating how many waves were created in this batch

## Capabilities

### New Capabilities
<!-- None — modifying existing capability -->

### Modified Capabilities
- `auto-group-photos`: Progress overlay wave count now uses the server-reported `wavesCreated` field instead of client-side Set counting, fixing inaccurate progress display during auto-group operations

## Impact

- **Code**: `src/screens/WavesHub/index.js` (handleAutoGroup callback), `src/screens/Waves/reducer.js` (autoGroupPhotos mutation selection set)
- **APIs**: `autoGroupPhotosIntoWaves` response gains `wavesCreated: Int!` field (backend already implemented)
- **Dependencies**: None
