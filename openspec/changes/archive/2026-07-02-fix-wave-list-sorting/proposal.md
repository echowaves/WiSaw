# Fix Wave List Sorting

## Problem

The WavesHub screen uses a client-side `filteredWaves` memo that sorts waves by `createdAt` descending, overriding the backend's actual sort order (`updatedAt` descending by default). This causes two bugs:

1. **Wrong sort field**: Backend sorts by `updatedAt`, client sorts by `createdAt` — different ordering
2. **Search results re-sorted**: When text search is active, backend returns relevance-ordered results, but client re-sorts by date, destroying relevance ranking

## Solution

Remove the client-side `filteredWaves` sorting in WavesHub. Use the `waves` array directly from `setWaves(data.waves)`, matching the pattern already used by `WaveSelectorModal` and `MergeWaveModal`. The backend `listWaves` resolver already handles both filtering (ILIKE on `name` + `description`) and sorting (by `updatedAt`, `name`, or `photosCount`) server-side.

## Impact

- **Files changed**: `src/screens/WavesHub/index.js` (remove `filteredWaves` useMemo, use `waves` directly)
- **No backend changes required**: `listWaves` already supports `searchTerm` and sort parameters
- **Backward compatible**: Existing sort order (`updatedAt` DESC) is preserved
