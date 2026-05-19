# Rename Granularity to GroupingLevel

## Why

The backend has been updated to use `GroupingLevel` / `groupingLevel` consistently across the GraphQL schema, resolvers, and database (see [`field-matching-grouping`](../Wisaw.cdk/openspec/changes/field-matching-grouping/design.md) change). The client still uses the old `granularity` naming, creating a naming inconsistency between client and server.

Additionally, the client-side UI descriptions reference distance-based grouping ("Within ~50 km") which is now misleading since the backend uses field-matching grouping, not distance-based grouping.

## What Changes

- Rename `granularity` → `groupingLevel` across all client files (6 files, ~36 occurrences)
- Rename storage key `@grouping:granularity` → `@grouping:groupingLevel` with backward-compatible migration
- Rename functions: `setGroupingGranularity` → `setGroupingLevel`, `saveGroupingGranularity` → `saveGroupingLevel`, `getGranularityThreshold` → `getGroupingThreshold`
- Update UI text: "Granularity" → "Grouping Level"
- Update screen descriptions to reflect field-matching behavior instead of distance thresholds
- Update distance threshold descriptions to describe field-matching behavior

## Impact

- **Modified files**: `src/utils/groupingAtom.js`, `src/utils/groupingStorage.js`, `src/screens/GroupingSettings/index.js`, `src/screens/WaveSettings/index.js`, `src/hooks/useLocationDrift.js`, `src/utils/__tests__/groupingStorage.test.js`
- **Storage migration**: Old storage key `@grouping:granularity` will be read on first load and written to `@grouping:groupingLevel` for seamless migration
- **No breaking changes**: The GraphQL schema already uses `groupingLevel` on the server; the client just needs to pass the correct parameter name

## Capabilities

### Modified Capabilities
- `auto-group-photos`: Client-side naming aligned with server-side `GroupingLevel` enum and `groupingLevel` parameter
