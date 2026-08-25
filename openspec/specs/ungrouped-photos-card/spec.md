## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for ungrouped photos card in WiSaw.

## Requirements

### Requirement: Ungrouped photos card displays ungrouped photos
The `UngroupedPhotosCard` component SHALL render a visually distinct card containing a `WavePhotoStrip` that loads photos via `requestUngroupedPhotos`. The card SHALL display the title "Ungrouped Photos" with the count, and SHALL have an accent background (MAIN_COLOR at 10% opacity) with a dashed border to distinguish it from regular wave cards.

#### Scenario: Card renders with ungrouped photos
- **WHEN** `UngroupedPhotosCard` mounts with `ungroupedCount > 0`
- **THEN** the card SHALL display "Ungrouped Photos (N)" as the title
- **THEN** a `WavePhotoStrip` SHALL be rendered with `fetchFn` set to `requestUngroupedPhotos`
- **THEN** the strip SHALL immediately fetch page 0 on mount

#### Scenario: Card visual distinction
- **WHEN** the ungrouped card is rendered
- **THEN** the background SHALL use `MAIN_COLOR` at 10% opacity
- **THEN** the border SHALL be dashed style
- **THEN** the card SHALL be visually distinguishable from regular wave cards

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

### Requirement: Ungrouped Photos Count Updates
When auto-grouping completes, the ungrouped photos count SHALL update in real-time via the `ungroupedPhotosCount` atom.

#### Scenario: Ungrouped count updates after auto-group
- **WHEN** the auto-group operation completes and `emitAutoGroupDone()` is called
- **THEN** the `ungroupedPhotosCount` atom SHALL be updated via `fetchCounts()`
- **THEN** the UngroupedPhotosCard prop `ungroupedCount` SHALL reflect the new value
- **THEN** the card title SHALL display the updated count (e.g., "Ungrouped Photos (5)")

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
