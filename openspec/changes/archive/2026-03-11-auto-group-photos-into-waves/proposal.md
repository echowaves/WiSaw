## Why

Users currently must manually create waves and add individual photos to them. This is tedious when a user has many ungrouped photos. The backend already provides an `autoGroupPhotosIntoWaves` mutation that intelligently groups photos into waves automatically (likely based on location/time proximity), but the frontend has no UI to trigger it. Exposing this capability lets users organize their photo library effortlessly with a single action.

## What Changes

- Add an "Auto-Group" button to the Waves screen that calls the `autoGroupPhotosIntoWaves` GraphQL mutation
- Display results feedback (number of waves created and photos grouped) after the operation completes
- Refresh the waves list automatically after auto-grouping completes
- Add confirmation dialog before triggering auto-group to prevent accidental invocations
- Handle loading states and errors during the auto-group operation

## Capabilities

### New Capabilities
- `auto-group-photos`: UI and GraphQL integration to trigger automatic photo grouping into waves via the `autoGroupPhotosIntoWaves` mutation, including user feedback on results

### Modified Capabilities
- `photo-feed`: The photo feed may need to reflect wave assignments after auto-grouping (existing wave filtering already supported via `waveUuid` parameter)

## Impact

- **Code**: Waves screen (`src/screens/Waves/index.js`) and reducer (`src/screens/Waves/reducer.js`) gain new mutation and UI elements
- **APIs**: New GraphQL mutation call: `autoGroupPhotosIntoWaves(uuid: String!): AutoGroupResult!` returning `{ wavesCreated: Int!, photosGrouped: Int! }`
- **Dependencies**: No new dependencies required — uses existing Apollo Client and UI components
- **Systems**: Backend API must have the `autoGroupPhotosIntoWaves` resolver deployed
