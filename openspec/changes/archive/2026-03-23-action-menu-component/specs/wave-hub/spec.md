## MODIFIED Requirements

### Requirement: Wave Card Context Menu
The system SHALL show an `ActionMenu` modal on long-press of a wave card with icon + label management options.

#### Scenario: Owner long-presses their own wave card
- **WHEN** the wave owner long-presses a wave card
- **THEN** an `ActionMenu` modal SHALL display with items:
  - `pencil-outline` icon: "Rename"
  - `text-box-edit-outline` icon: "Edit Description"
  - `call-merge` icon: "Merge Into Another Wave..."
  - separator
  - `trash-can-outline` icon: "Delete Wave" (destructive)

#### Scenario: User deletes a wave from context menu
- **WHEN** the user selects Delete Wave from the ActionMenu
- **THEN** a confirmation dialog is shown
- **THEN** upon confirmation, the wave is deleted and removed from the grid
- **THEN** the system SHALL emit `autoGroupDone` to trigger an ungrouped-photos count refresh

#### Scenario: Post-merge list update
- **WHEN** a merge completes successfully from WavesHub
- **THEN** the source wave SHALL be removed from the waves list
- **THEN** the target wave's `photosCount` SHALL be updated to reflect the merged total
- **THEN** a success toast SHALL be shown
