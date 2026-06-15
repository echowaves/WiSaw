## Purpose
This specification defines the refresh coalescing behavior for the Waves screen to eliminate UI freezes during multi-batch photo uploads.

## Requirements
### Requirement: handleRefresh function identity is stable across keystrokes
The `handleRefresh` function SHALL NOT include `debouncedSearch` in its dependency array, preventing the function from being recreated on every keystroke. The current search term SHALL be read from a ref (`debouncedSearchRef`) instead of a state dependency, so the three event subscriptions (`useFocusEffect`, `subscribeToAutoGroupDone`, `subscribeToUploadComplete`) do not re-subscribe on every keystroke.

#### Scenario: handleRefresh identity survives keystrokes
- **WHEN** the user types "beach" into the search bar on the Waves screen
- **THEN** `handleRefresh` SHALL maintain the same function identity (not recreated)
- **THEN** the `subscribeToUploadComplete` subscription SHALL remain bound to the same handler
- **THEN** the `subscribeToAutoGroupDone` subscription SHALL remain bound to the same handler
- **THEN** the `useFocusEffect` callback SHALL remain bound to the same handler

### Requirement: Rapid refresh events are coalesced via timer
When multiple events trigger `handleRefresh` within a 300ms window (e.g., 10 photo uploads firing `emitUploadComplete`), only ONE refresh SHALL execute. Subsequent calls within the window SHALL reset the timer (debounce style), and the refresh SHALL fire once after the last event in the burst.

#### Scenario: 10 rapid upload events trigger one refresh
- **WHEN** 10 photos are uploaded in rapid succession (each firing `emitUploadComplete`)
- **THEN** `handleRefresh` SHALL be called 10 times within ~200ms
- **THEN** the first 9 calls SHALL reset the 300ms timer (no-op)
- **THEN** a single `handleRefresh` SHALL execute ~300ms after the last upload event
- **THEN** the waves list SHALL reflect all 10 uploads in one fetch

#### Scenario: Burst of 3 events triggers one refresh
- **WHEN** auto-group completes (1 event) and 2 uploads complete (2 events) within 300ms
- **THEN** `handleRefresh` SHALL fire exactly once ~300ms after the last event
- **THEN** the waves list SHALL be fresh and correct after that single refresh

#### Scenario: Events separated by >300ms each trigger their own refresh
- **WHEN** upload event A fires at t=0
- **WHEN** upload event B fires at t=500ms (>300ms after A)
- **THEN** `handleRefresh` SHALL fire at t=300ms (for event A)
- **THEN** `handleRefresh` SHALL fire at t=800ms (for event B)

### Requirement: handleRefresh awaits GraphQL queries sequentially
The `handleRefresh` function SHALL be async and SHALL use `await Promise.all()` to run `loadWaves` and `fetchCounts` concurrently, ensuring both complete before the function returns. This prevents partial state updates where the waves list is stale while the count is fresh.

#### Scenario: State updates are atomic after refresh
- **WHEN** `handleRefresh()` is called
- **THEN** `loadWaves()` and `fetchCounts()` SHALL run concurrently via `Promise.all`
- **THEN** both SHALL complete before `handleRefresh` returns
- **THEN** the waves list AND the badge count SHALL be fresh and consistent

#### Scenario: setRefreshing(false) runs only after all queries complete
- **WHEN** `handleRefresh()` is called
- **THEN** `setRefreshing(true)` SHALL run at the start
- **THEN** `setRefreshing(false)` SHALL run in a `finally` block after `await Promise.all()`
- **THEN** the pull-to-refresh spinner SHALL disappear only after both queries complete

### Requirement: loadWaves no longer manages setRefreshing state
The `loadWaves` function SHALL NOT call `setRefreshing(false)` in its finally block. Only `handleRefresh` (the sole caller that sets `setRefreshing(true)`) SHALL manage the refreshing state, preventing race conditions where `loadWaves` sets refreshing to false while `handleRefresh` is still awaiting `fetchCounts()`.

#### Scenario: loadWaves does not reset refreshing prematurely
- **WHEN** `handleRefresh` calls `loadWaves(0, batch, true)` and `fetchCounts()` concurrently
- **THEN** `loadWaves` SHALL set `setLoading(true)` but NOT call `setRefreshing(false)`
- **THEN** `handleRefresh` SHALL set `setRefreshing(false)` only after both queries complete
- **THEN** the pull-to-refresh spinner SHALL NOT disappear prematurely

### Requirement: Search debounce triggers scheduled refresh instead of direct loadWaves
When the debounced search text changes, the effect SHALL call `scheduleRefresh()` (via a timer) instead of calling `loadWaves()` directly. This ensures search changes are treated like any other refresh event — coalesced with other rapid events.

#### Scenario: Typing search triggers coalesced refresh
- **WHEN** the user types "beach" in 5 keystrokes (each 50ms apart)
- **THEN** `debouncedSearch` SHALL update after 300ms of no typing
- **THEN** the effect SHALL call `scheduleRefresh()` (not `loadWaves` directly)
- **THEN** `handleRefresh` SHALL execute once with the latest search term
- **THEN** the waves list SHALL be filtered to show only matching waves
