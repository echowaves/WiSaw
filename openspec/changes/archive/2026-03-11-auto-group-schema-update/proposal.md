## Why

The `autoGroupPhotosIntoWaves` GraphQL mutation return type has been updated to include `photosRemaining` and `hasMore` fields, and makes `waveUuid`/`name` nullable (null when no more groups to create). The frontend loop currently uses `photosGrouped === 0` as the termination condition and lacks progress feedback. Aligning with the new schema enables proper loop control via `hasMore` and lets the UI show remaining-photo progress during the operation.

## What Changes

- **BREAKING**: Update the GraphQL mutation selection set to include `photosRemaining` and `hasMore` fields from the new `AutoGroupResult` type
- Use `hasMore` boolean as the loop termination condition instead of checking `photosGrouped === 0`
- Remove the `// eslint-disable-next-line no-constant-condition` workaround since the loop now uses `hasMore` naturally

## Capabilities

### New Capabilities

### Modified Capabilities
- `auto-group-photos`: Loop termination changes from `photosGrouped === 0` to `hasMore === false`; mutation selection set adds `photosRemaining` and `hasMore`

## Impact

- **Code**: `src/screens/Waves/reducer.js` (mutation selection set), `src/screens/Waves/index.js` (loop logic)
- **APIs**: `autoGroupPhotosIntoWaves` now returns `{ waveUuid: String, name: String, photosGrouped: Int!, photosRemaining: Int!, hasMore: Boolean! }`
- **Dependencies**: None
- **Systems**: Requires updated backend with new `AutoGroupResult` type deployed
