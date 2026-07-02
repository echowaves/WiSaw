# Friends Sort Specification (Updated)

## Purpose
Friends list is sorted by `createdAt` (friendship creation date) in descending order — newest first. Pending friends are always pinned to the top.

## Requirements

### Requirement: Friends list sort order
The friends list SHALL be sorted by `createdAt` (friendship creation date) in descending order — newest friendships first.

#### Scenario: Default sort order
- **WHEN** the friends list loads
- **THEN** confirmed friends SHALL appear sorted by `createdAt` descending (newest first)
- **THEN** pending friends SHALL remain pinned at the top of the list

#### Scenario: No sort picker
The friends screen SHALL NOT provide a sort picker button or SortOrderPicker modal. The sort order is fixed and cannot be changed by the user.

### Requirement: Pending friends pinned to top
Pending friends SHALL always appear at the top of the friends list as a group, regardless of the selected sort option. Only confirmed friends SHALL be affected by sort selection.

#### Scenario: Pending friends with fixed sort
- **WHEN** the friends list loads and has both pending and confirmed friends
- **THEN** all pending friends SHALL appear at the top of the list
- **THEN** confirmed friends SHALL appear below, sorted by `createdAt` descending

### Requirement: No sort state management
Sort state SHALL NOT be managed via Jotai atoms. The sort order is fixed and does not need to be stored or persisted.
