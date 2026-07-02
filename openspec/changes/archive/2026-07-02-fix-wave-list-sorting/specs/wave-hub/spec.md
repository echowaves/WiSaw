# Wave Hub — Sorting & Search Spec

## Requirement: Wave List Sorting

**GIVEN** the user views the Waves Hub screen
**WHEN** waves are loaded from the backend via `listWaves`
**THEN** the waves SHALL be displayed in the order returned by the backend (default: `updatedAt` DESC)
**AND** no client-side re-sorting SHALL be applied

### Requirement: Text Search Filtering

**GIVEN** the user is viewing the Waves Hub screen
**WHEN** the user types in the search input
**THEN** the debounced search value SHALL be passed as `searchTerm` to `listWaves`
**AND** the backend SHALL filter waves by `ILIKE` match on `name` and `description`
**AND** the client SHALL NOT perform any additional client-side filtering of waves
**AND** the client SHALL NOT apply any sort order to the filtered results

### Requirement: Pagination

**GIVEN** the user scrolls to the bottom of the wave list
**WHEN** more waves are loaded via `handleLoadMore`
**THEN** `loadWaves` SHALL be called with the current `searchTerm` to maintain filter context
**AND** new waves SHALL be appended to the `waves` array without client-side re-sorting

### Requirement: Refresh

**GIVEN** the user pulls to refresh
**WHEN** `handleRefresh` is triggered
**THEN** `loadWaves(0, newBatch, true, debouncedSearch)` SHALL reset pagination and re-fetch
**AND** the `waves` state SHALL be replaced (not appended) with the fresh server data

### Requirement: Empty States

**GIVEN** the user searches with no matching waves
**WHEN** the backend returns an empty waves array
**THEN** the empty state SHALL display "No Results Found" with the search keyword
