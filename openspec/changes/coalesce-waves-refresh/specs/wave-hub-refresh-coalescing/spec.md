## Purpose
This specification defines the simplified refresh behavior for the Waves screen to eliminate UI freezes during multi-batch photo uploads.

## Requirements
### Requirement: Refresh only on explicit user actions
The Waves screen SHALL only refresh when the user explicitly navigates to the screen, pulls to refresh, or changes the search term. No scheduled refreshes or event-based refreshes SHALL occur.

#### Scenario: Screen focus triggers refresh
- **WHEN** user navigates to the Waves screen
- **THEN** `handleRefresh()` SHALL execute once via `useFocusEffect`

#### Scenario: Pull to refresh triggers refresh
- **WHEN** user pulls down on the waves list
- **THEN** `handleRefresh()` SHALL execute once via `onRefresh` handler

#### Scenario: Search change triggers refresh
- **WHEN** user types in the search box
- **THEN** after debounced search updates, `handleRefresh()` SHALL execute once

### Requirement: handleRefresh function identity is stable
The `handleRefresh` function SHALL have a stable identity across keystrokes. The search term SHALL be read from a ref (`debouncedSearchRef`) instead of a state dependency to prevent unnecessary re-creations.

#### Scenario: handleRefresh identity survives keystrokes
- **WHEN** the user types "beach" into the search bar on the Waves screen
- **THEN** `handleRefresh` SHALL maintain the same function identity (not recreated)
- **THEN** the search term is read from `debouncedSearchRef` when refresh executes

### Requirement: Guard prevents concurrent refreshes
Only one `handleRefresh` operation SHALL run at a time. Subsequent calls while refresh is running SHALL be ignored (no-op).

#### Scenario: Concurrent refresh calls are ignored
- **WHEN** `handleRefresh()` is called and `refreshRunningRef.current` is `true`
- **THEN** the call SHALL return immediately without starting a new refresh
- **THEN** no duplicate GraphQL queries SHALL execute simultaneously

### Requirement: Search debounce triggers immediate refresh (no timer)
When the debounced search text changes, the effect SHALL call `handleRefresh()` directly (no timer). Search refresh is treated as an explicit user action.

#### Scenario: Typing search triggers immediate refresh
- **WHEN** the user types "beach" in 5 keystrokes (each 50ms apart)
- **THEN** `debouncedSearch` SHALL update after 300ms of no typing
- **THEN** the effect SHALL call `handleRefresh()` directly (not via timer)
- **THEN** the waves list SHALL be filtered to show only matching waves
