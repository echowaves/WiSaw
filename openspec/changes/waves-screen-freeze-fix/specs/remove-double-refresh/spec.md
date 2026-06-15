# ADDED remove-double-refresh

## ADDED Requirements

### Requirement: Remove double refresh after auto-group

Only ONE `handleRefresh` **SHALL** run after auto-group completes to prevent duplicate queries.

#### Scenario: Double refresh causes issues

- **WHEN** auto-group completes and both `handleRefresh` calls run
- **THEN** Two sets of queries run concurrently, state may interleave incorrectly

### Requirement: Single refresh after auto-group

Only ONE refresh **SHALL** run after auto-group completes.

#### Scenario: Single refresh flow

- **WHEN** `emitAutoGroupDone()` triggers `handleRefresh` via listener
- **THEN** Only ONE set of queries runs, state updates cleanly

### Requirement: Auto-group completion doesn't cause freeze

Auto-group completion **SHALL NOT** cause the screen to freeze.

#### Scenario: Auto-group completion flow

- **WHEN** auto-group completes
- **THEN** Single refresh runs, screen loads consistently without freeze

---

