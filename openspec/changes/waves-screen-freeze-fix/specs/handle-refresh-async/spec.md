# ADDED handle-refresh-async

## ADDED Requirements

### Requirement: handleRefresh waits for async operations

`handleRefresh` **SHALL** wait for all async operations to complete before returning to prevent race conditions.

#### Scenario: handleRefresh completes before rendering

- **WHEN** `handleRefresh` is called
- **THEN** `loadWaves` and `fetchCounts` both complete before state updates are rendered

### Requirement: Promise.all ensures both operations complete

Both `loadWaves` and `fetchCounts` **SHALL** complete before state updates.

#### Scenario: Promise.all waits for both operations

- **WHEN** `Promise.all` is used with `await`
- **THEN** Both operations complete before state updates happen

### Requirement: Auto-group completion loads consistent data

When auto-group completes, the screen **SHALL** load with consistent data without freezing.

#### Scenario: Auto-group completion flow

- **WHEN** auto-group completes and `handleRefresh` is called
- **THEN** Both waves list and counts are fetched, screen renders consistently, no freeze occurs
