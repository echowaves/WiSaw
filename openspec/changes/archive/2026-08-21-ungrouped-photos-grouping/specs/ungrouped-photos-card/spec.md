## Purpose
Defines the ungrouped-photos card used on the Waves Hub and its grouping behavior.

## ADDED Requirements

### Requirement: Ungrouped photos card selection mode
The `UngroupedPhotosCard` SHALL support entering a selection mode in which each photo in the `WavePhotoStrip` shows a checkbox overlay and can be individually toggled. A toolbar SHALL show a "Select All" control, the current selected count, and a "Cancel" control. Selecting photos SHALL unlock the "Create a wave" and "Add to an existing wave" actions; the "Auto-Group everything" action SHALL always be available.

#### Scenario: Enter selection mode
- **WHEN** the user presses the "Select photos" control
- **THEN** the `WavePhotoStrip` SHALL render a checkbox overlay on each thumbnail
- **THEN** a toolbar SHALL appear with "Select All", the selected count, and "Cancel"

#### Scenario: Toggle individual and all photos
- **WHEN** the user taps an individual thumbnail
- **THEN** that photo SHALL be added to or removed from the selection
- **THEN** tapping "Select All" SHALL select every ungrouped photo currently shown
- **THEN** tapping "Cancel" SHALL exit selection mode and clear the selection

### Requirement: Ungrouped photos card auto-group action
The `UngroupedPhotosCard` SHALL include an "Auto-Group everything" action. Pressing it SHALL trigger server-side auto-grouping via the `autoGroupPhotosIntoWaves` mutation, which clusters the *entire* ungrouped pool server-side and ignores the current per-photo selection.

#### Scenario: Auto-group everything
- **WHEN** the user presses "Auto-Group everything"
- **THEN** `autoGroupPhotosIntoWaves(uuid, groupingLevel)` SHALL be called server-side
- **THEN** the server SHALL group all ungrouped photos for the user
- **THEN** after the operation completes, the ungrouped count SHALL drop to 0 and the card SHALL be hidden

### Requirement: Ungrouped photos card manual grouping actions
The `UngroupedPhotosCard` SHALL include a "Create a wave" action and an "Add to an existing wave" action. These actions SHALL only be enabled when the user has selected at least one photo. Pressing "Create a wave" SHALL open the `WaveSelectorModal` in create mode; pressing "Add to an existing wave" SHALL open the `WaveSelectorModal` for selecting an existing wave. Either action SHALL call `addPhotoToWave` once per selected photo.

#### Scenario: Manual grouping is gated on selection
- **WHEN** the user has selected zero photos
- **THEN** "Create a wave" and "Add to an existing wave" SHALL be disabled
- **THEN** "Auto-Group everything" SHALL remain enabled

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
