# Wave Hub — Search Reliability Spec

## Requirement: Search State Synchronization

**GIVEN** the user is viewing the Waves Hub screen
**WHEN** the user types in the search input
**THEN** the debounced search value SHALL be correctly passed to the `listWaves` GraphQL query
**AND** `handleRefresh` SHALL use the current `debouncedSearch` value (not a stale closure value)
**AND** the React `useCallback` for `handleRefresh` SHALL include `debouncedSearch` in its dependency array

### Requirement: No Stale Closures

**GIVEN** the user types a search query and the debounced value updates
**WHEN** the `useEffect` that depends on `debouncedSearch` fires and calls `handleRefresh`
**THEN** `handleRefresh` SHALL read the **current** value of `debouncedSearch` from its closure
**AND** `handleRefresh` SHALL NOT capture a stale initial value
