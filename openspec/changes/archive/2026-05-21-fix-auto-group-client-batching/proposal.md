## Why

The backend `autoGroupPhotosIntoWaves` mutation is being updated to process photos in batches of 200 (instead of all at once) and now returns real `hasMore`/`photosRemaining` values. The client loop already handles `hasMore`, but it counts waves incorrectly — it increments `totalWavesCreated` once per API call, which is wrong when a single batch can create multiple waves. The progress display also lacks `photosRemaining` feedback, making large batched operations feel opaque.

## What Changes

- Fix wave count tracking: collect unique `waveUuid` values across loop iterations using a `Set` instead of blindly incrementing a counter per API call
- Update progress display to show `photosRemaining` from the API response, giving users real-time feedback during multi-batch operations (e.g., "156 photos grouped into 4 waves — 344 remaining")
- Update ungrouped count from `photosRemaining` on completion instead of hardcoding to 0

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `auto-group-photos`: Fix wave counting logic to track unique waveUuids across batches; update progress text to include photosRemaining; use photosRemaining from final API response for ungrouped count

## Impact

- **Code**: `src/screens/WavesHub/index.js` — `handleAutoGroup` callback (wave counting, progress state, ungrouped count update)
- **APIs**: No changes — client already queries `waveUuid`, `photosGrouped`, `photosRemaining`, `hasMore`
- **Dependencies**: None
