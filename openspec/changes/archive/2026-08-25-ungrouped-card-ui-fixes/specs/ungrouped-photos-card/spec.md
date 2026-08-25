## MODIFIED Requirements

### Requirement: Ungrouped photos card auto-group action
The `UngroupedPhotosCard` SHALL include an "Auto-Group everything" action. Pressing it SHALL trigger server-side auto-grouping via the `autoGroupPhotosIntoWaves` mutation, which clusters the *entire* ungrouped pool server-side and ignores the current per-photo selection. The action SHALL be laid out on its own dedicated row at the very bottom of the card, separate from the manual grouping actions ("Create a wave", "Add to an existing wave"), and SHALL be accompanied by inline explanation text on the same row that describes what the action does (automatically groups all ungrouped photos into waves).

#### Scenario: Auto-group action placement
- **WHEN** the ungrouped photos card is rendered
- **THEN** "Auto-Group everything" SHALL occupy its own full-width row at the bottom of the card
- **THEN** it SHALL NOT share its row with "Create a wave" or "Add to an existing wave"
- **THEN** explanation text describing that all ungrouped photos will be grouped into waves SHALL be shown alongside the button on the same row

#### Scenario: Auto-group everything
- **WHEN** the user presses "Auto-Group everything"
- **THEN** `autoGroupPhotosIntoWaves(uuid, groupingLevel)` SHALL be called server-side
- **THEN** the server SHALL group all ungrouped photos for the user
- **THEN** after the operation completes, the ungrouped count SHALL drop to 0 and the card SHALL be hidden
