## Why

The backend `autoGroupPhotosIntoWaves` mutation was updated to use season-based wave boundaries (e.g., "NYC, Spring 2026" instead of "NYC, Mar – Jun 2026"), skip non-matching photos instead of breaking on first miss, enforce a 1000-photo-per-wave limit, and remove the `groupingLevel` default fallback. The frontend needs to align with these behavioral changes: fix a hardcoded `groupingLevel: 'CITY'` in the post-upload auto-group path, update stale UI copy in GroupingSettings, and handle the mixed wave naming styles (old date-range vs new season-based) for visual consistency.

## What Changes

- **Fix `flushUngroupedPhotos` grouping level**: Use the user's configured `groupingLevel` from `_groupingState` instead of hardcoded `'CITY'`
- **Update GroupingSettings info text**: Replace vague "field-matching and local timestamps" copy with accurate description of season-based wave grouping behavior
- **Normalize wave display names**: Detect old date-range wave names and display them consistently alongside new season-based names in the waves list

## Capabilities

### New Capabilities

_None_

### Modified Capabilities

- `auto-group-photos`: Fix post-upload auto-group to use user's configured grouping level instead of hardcoded CITY
- `auto-group-settings`: Update info card copy to reflect season-based grouping behavior
- `wave-hub`: Normalize display of mixed wave naming styles (old date-range format vs new season format)

## Impact

- **Code**: `src/screens/PhotosList/upload/photoUploadService.js` — change hardcoded `'CITY'` to `_groupingState.groupingLevel`
- **Code**: `src/screens/GroupingSettings/index.js` — update info card text
- **Code**: `src/screens/WavesHub/index.js` or wave card component — wave name display normalization
- **APIs**: No GraphQL changes (schema unchanged, mutation signature unchanged)
- **Dependencies**: None
