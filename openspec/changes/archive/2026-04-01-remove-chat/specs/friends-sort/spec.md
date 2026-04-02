## MODIFIED Requirements

### Requirement: Friends list sort options
The friends screen SHALL provide sort options accessible via a header ActionMenu (⋮ button). Available sort options SHALL be: Alphabetical A-Z, Alphabetical Z-A, and Recently Added.

#### Scenario: User selects a sort option
- **WHEN** the user opens the header ActionMenu and selects a sort option
- **THEN** the friends list SHALL reorder according to the selected sort
- **THEN** the selected sort option SHALL display a checkmark in the ActionMenu

#### Scenario: Default sort order
- **WHEN** the user has not selected a sort option in the current session
- **THEN** the friends list SHALL default to Recently Added sort (newest first)

## REMOVED Requirements

### Requirement: Most Recent Chat sort option
**Reason**: Chat has been removed. The "Most Recent Chat" sort option is no longer meaningful.
**Migration**: Sort options reduced to Alphabetical A-Z, Alphabetical Z-A, and Recently Added.
