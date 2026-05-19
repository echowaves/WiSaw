## Why

The auto-group feature on the client side does not pass the user's configured `groupingLevel` to the server. Every auto-group call defaults to `'CITY'` regardless of the user's actual setting (DISTRICT, CITY, REGION, or COUNTRY). This means photos are grouped at the wrong geographic granularity, creating incorrect waves.

## What Changes

- **Client `autoGroupPhotos` mutation**: Add `groupingLevel` parameter to the GraphQL mutation
- **Client `useAutoGroup` / `handleAutoGroup`**: Read `groupingLevel` from the grouping atom and pass it to the mutation
- **Client `UngroupedPhotosCard`**: Pass `groupingLevel` when emitting auto-group events
- **Server**: No changes needed — server already accepts and correctly uses `groupingLevel`

## Capabilities

### Modified Capabilities
- `auto-grouping`: Requirement change — auto-group must respect the user's configured grouping level, not default to CITY

## Impact

- `src/screens/Waves/reducer.js` — `autoGroupPhotos` function needs new parameter
- `src/screens/WavesHub/index.js` — `handleAutoGroup` needs to read and pass groupingLevel
- `src/components/UngroupedPhotosCard/index.js` — may need groupingLevel for emitAutoGroup
- `src/utils/groupingAtom.js` — source of truth for groupingLevel
- `src/hooks/useLocationDrift.js` — uses groupingLevel for drift threshold
