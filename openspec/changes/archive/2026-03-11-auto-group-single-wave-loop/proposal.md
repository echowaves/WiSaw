## Why

The `autoGroupPhotosIntoWaves` backend API has changed: it now creates one wave at a time and returns the created wave details (`waveUuid`, `name`, `photosGrouped`) instead of batch counts. The frontend must be updated to call the mutation in a loop until all ungrouped photos are processed, and to show progressive feedback as each wave is created.

## What Changes

- Update the `autoGroupPhotos` reducer function to match the new API return shape (`{ waveUuid, name, photosGrouped }` instead of `{ wavesCreated, photosGrouped }`)
- Implement a loop in the auto-group handler that calls the mutation repeatedly until `photosGrouped === 0` (no more ungrouped photos)
- Show progressive toast/feedback as each wave is created during the loop
- Update the waves list incrementally as each wave comes back from the API
- Handle the "no ungrouped photos" case (first call returns `photosGrouped === 0`)

## Capabilities

### New Capabilities

### Modified Capabilities
- `auto-group-photos`: The mutation return shape changes from batch summary to single-wave result, and invocation changes from single call to loop-until-done

## Impact

- **Code**: `src/screens/Waves/reducer.js` (mutation GraphQL template and return type), `src/screens/Waves/index.js` (handleAutoGroup callback logic, toast messages)
- **APIs**: `autoGroupPhotosIntoWaves(uuid: String!)` now returns `{ waveUuid: String!, name: String!, photosGrouped: Int! }` instead of `{ wavesCreated: Int!, photosGrouped: Int! }`
- **Dependencies**: None — no new packages needed
- **Systems**: Requires the updated backend API to be deployed
