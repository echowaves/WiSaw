## MODIFIED Requirements

### Requirement: Ungrouped photos card auto-group action
The `UngroupedPhotosCard` SHALL include an "Auto-Group everything" action. Pressing it SHALL trigger server-side auto-grouping via the `autoGroupPhotosIntoWaves` mutation, which clusters the *entire* ungrouped pool server-side and ignores the current per-photo selection. The action SHALL be laid out on its own dedicated row at the very bottom of the card, separate from the manual grouping actions ("Create a wave", "Add to an existing wave"), and SHALL be accompanied by inline explanation text on the same row that describes what the action does (automatically groups all ungrouped photos into waves). The action SHALL be enabled only when no photos are selected and SHALL be disabled while auto-grouping is in progress. The action SHALL remain visible in the card's layout while disabled (dimmed, not hidden).

#### Scenario: Auto-group action placement
- **WHEN** the ungrouped photos card is rendered
- **THEN** "Auto-Group everything" SHALL occupy its own full-width row at the bottom of the card
- **THEN** it SHALL NOT share its row with "Create a wave" or "Add to an existing wave"
- **THEN** explanation text describing that all ungrouped photos will be grouped into waves SHALL be shown alongside the button on the same row
- **THEN** the button SHALL retain a visible (non-zero) width, sharing the row's flex space with the explanation text

#### Scenario: Auto-group everything
- **WHEN** the user has selected zero photos and presses "Auto-Group everything"
- **THEN** `autoGroupPhotosIntoWaves(uuid, groupingLevel)` SHALL be called server-side
- **THEN** the server SHALL group all ungrouped photos for the user
- **THEN** after the operation completes, the ungrouped count SHALL drop to 0 and the card SHALL be hidden

#### Scenario: Auto-group is unavailable during per-photo selection
- **WHEN** the user has selected one or more photos
- **THEN** "Auto-Group everything" SHALL be disabled
- **THEN** it SHALL remain visible with a dimmed disabled appearance
- **THEN** pressing it SHALL NOT trigger the auto-group mutation

### Requirement: Ungrouped photos card selection mode
The `UngroupedPhotosCard` SHALL support entering a selection mode in which each photo in the `WavePhotoStrip` shows a checkbox overlay and can be individually toggled. A toolbar SHALL show a "Select All" control, the current selected count, and a "Cancel" control. Selecting one or more photos SHALL unlock the "Create a wave" and "Add to an existing wave" actions and SHALL disable "Auto-Group everything". With zero photos selected, "Auto-Group everything" SHALL be enabled unless auto-grouping is in progress.

#### Scenario: Enter selection mode
- **WHEN** the user presses the "Select photos" control
- **THEN** the `WavePhotoStrip` SHALL render a checkbox overlay on each thumbnail
- **THEN** a toolbar SHALL appear with "Select All", the selected count, and "Cancel"

#### Scenario: Toggle individual and all photos
- **WHEN** the user taps an individual thumbnail
- **THEN** that photo SHALL be added to or removed from the selection
- **THEN** tapping "Select All" SHALL select every ungrouped photo currently shown
- **THEN** tapping "Cancel" SHALL exit selection mode and clear the selection
- **THEN** clearing the selection SHALL re-enable "Auto-Group everything"

### Requirement: Ungrouped photos card manual grouping actions
The `UngroupedPhotosCard` SHALL include a "Create a wave" action and an "Add to an existing wave" action. These actions SHALL only be enabled when the user has selected at least one photo. Pressing "Create a wave" SHALL open the `WaveSelectorModal` in create mode; pressing "Add to an existing wave" SHALL open the `WaveSelectorModal` for selecting an existing wave. Either action SHALL call `addPhotoToWave` once per selected photo.

#### Scenario: Manual grouping is gated on selection
- **WHEN** the user has selected zero photos
- **THEN** "Create a wave" and "Add to an existing wave" SHALL be disabled
- **THEN** "Auto-Group everything" SHALL be enabled unless auto-grouping is in progress

#### Scenario: Selected photos use manual grouping only
- **WHEN** the user has selected one or more photos
- **THEN** "Create a wave" and "Add to an existing wave" SHALL be enabled
- **THEN** "Auto-Group everything" SHALL be disabled

#### Scenario: Add selected photos to an existing wave
- **WHEN** the user selects one or more photos and picks an existing wave
- **THEN** the `WaveSelectorModal` SHALL open and a wave SHALL be selected
- **THEN** `addPhotoToWave` SHALL be called once per selected photo
- **THEN** the selected photos SHALL appear in the chosen wave and drop out of the ungrouped pool

#### Scenario: Create a wave for selected photos
- **WHEN** the user selects one or more photos and chooses to create a wave
- **THEN** the `WaveSelectorModal` SHALL open in create mode
- **THEN** a new wave SHALL be created
- **THEN** `addPhotoToWave` SHALL be called once per selected photo against the new wave