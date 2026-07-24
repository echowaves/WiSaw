# Friends Sort Delta Spec

## MODIFIED Requirements

### Requirement: Friends list sort order
The friends screen SHALL sort confirmed friends by most recent photo activity (`updatedAt`) with newest first. There is no user-configurable sort option — the sort order is fixed.

#### Scenario: Friends sorted by most recent photo activity
- **WHEN** the friends list is displayed
- **THEN** confirmed friends SHALL be ordered by the most recent photo's `updatedAt` field, newest first
- **THEN** friends with no photos SHALL fall back to the friendship `createdAt` field, newest first

#### Scenario: Pending friends appear above confirmed friends
- **WHEN** the friends list is displayed with pending friendships
- **THEN** pending friendships SHALL appear in a separate section above confirmed friends
- **THEN** confirmed friends SHALL be sorted by most recent photo activity as described above

#### Scenario: Sort uses photo updatedAt not friendship createdAt
- **WHEN** two confirmed friends exist and one has a more recently updated photo
- **THEN** the friend with the more recently updated photo SHALL appear first regardless of which friendship was created more recently

## REMOVED Requirements

### Requirement: Friends list sort options
**Reason**: Sort picker was removed in change `2026-07-02-remove-sort-selector-waves-friends`. The friends list uses a fixed sort order (most recent photo activity) with no user-configurable options.
**Migration**: No migration needed — the sort picker and atoms are already removed from the codebase. This removal formalizes that state in the spec.

### Requirement: Friends sort state management
**Reason**: Jotai atoms `friendsSortBy` and `friendsSortDirection` were removed from `src/state.js` in change `2026-07-02-remove-sort-selector-waves-friends`. No sort state is managed since the sort order is fixed.
**Migration**: No migration needed — these atoms are already removed from the codebase.

## ADDED Requirements

### Requirement: GraphQL query includes photo updatedAt
The `getFriendshipsList` GraphQL query SHALL include `updatedAt` in the `photos` sub-selection so the frontend can compute per-friend activity timestamps.

#### Scenario: Query returns updatedAt for photos
- **WHEN** `getFriendshipsList` is called
- **THEN** each photo in the `photos` array SHALL include the `updatedAt` field
