# Photo Wave Assignment Specification

## Purpose
Photo wave assignment enables users to add existing photos to waves, create new waves from photos, remove photos from waves, and use a selection mode for batch operations. This bridges the photo feed with the wave management system.

## Requirements

### Requirement: Photo Selection Mode for Adding to Wave
The system SHALL provide a photo selection screen that displays the user's own uploads in a masonry grid with selectable checkmark overlays.

#### Scenario: User enters photo selection mode
- **WHEN** the user taps "Add Photos" from a Wave Detail screen
- **THEN** a Photo Selection Mode screen is pushed showing the user's uploaded photos
- **THEN** photos are displayed in a masonry grid with `ExpandableThumb` in selection mode

#### Scenario: User selects photos
- **WHEN** the user taps a photo in selection mode
- **THEN** a checkmark overlay appears on the photo indicating selection
- **THEN** the floating action bar shows the count of selected photos

#### Scenario: User deselects a photo
- **WHEN** the user taps an already-selected photo
- **THEN** the checkmark overlay is removed
- **THEN** the selected count in the floating bar is decremented

#### Scenario: User confirms adding photos to wave
- **WHEN** the user taps the "Add" button in the floating action bar
- **THEN** `addPhotoToWave` mutation is called for each selected photo
- **THEN** a success toast shows the number of photos added
- **THEN** the user is navigated back to the Wave Detail screen

#### Scenario: User cancels selection
- **WHEN** the user taps the back button or "Done" with no selection
- **THEN** no photos are added and the user returns to Wave Detail

### Requirement: Add Existing Photo to Wave from Feed
The system SHALL allow users to add a photo to an existing wave via the quick-actions modal triggered by long-press in the main photo feed.

#### Scenario: User long-presses a photo in the feed
- **WHEN** the user long-presses a photo in the main feed
- **THEN** a quick-actions modal appears with a photo preview and all action buttons
- **THEN** the Wave button is available among the action buttons

#### Scenario: User adds photo to wave from quick-actions modal
- **WHEN** the user taps the Wave button in the quick-actions modal on their own photo
- **THEN** the WaveSelectorModal opens with all available waves and a search field
- **THEN** the user selects a wave
- **THEN** `addPhotoToWave` mutation is called for the photo and selected wave
- **THEN** a success toast confirms the photo was added

### Requirement: Create New Wave from Photo
The system SHALL allow users to create a new wave and immediately add the current photo to it via the quick-actions modal or expanded photo view.

#### Scenario: User creates a new wave from quick-actions modal
- **WHEN** the user taps the Wave button in the quick-actions modal
- **THEN** the WaveSelectorModal opens
- **WHEN** the user taps "Create New Wave" and enters a name
- **THEN** the new wave is created via `createWave` mutation
- **THEN** the photo is immediately added to the new wave via `addPhotoToWave` mutation
- **THEN** a success toast confirms wave creation and photo assignment

#### Scenario: User creates a new wave from expanded photo view
- **WHEN** the user taps the Wave button in the expanded photo view
- **THEN** the WaveSelectorModal opens
- **WHEN** the user taps "Create New Wave" and enters a name
- **THEN** the new wave is created via `createWave` mutation
- **THEN** the photo is immediately added to the new wave via `addPhotoToWave` mutation
- **THEN** a success toast confirms wave creation and photo assignment

### Requirement: Remove Photo from Wave
The system SHALL allow removing a photo from a wave via the `removePhotoFromWave` GraphQL mutation.

#### Scenario: Photo removal succeeds
- **WHEN** `removePhotoFromWave` is called with valid `waveUuid` and `photoId`
- **THEN** the photo is disassociated from the wave
- **THEN** the UI reflects the removal immediately

#### Scenario: Photo removal fails
- **WHEN** `removePhotoFromWave` fails due to network or server error
- **THEN** an error toast is shown
- **THEN** the photo remains in the wave grid

### Requirement: ExpandableThumb Selection Mode
The `ExpandableThumb` component SHALL support an optional selection mode where tapping toggles a checkmark overlay instead of expanding the photo.

#### Scenario: ExpandableThumb rendered in selection mode
- **WHEN** `ExpandableThumb` receives `selectionMode={true}`
- **THEN** tapping the thumbnail toggles the `selected` state via `onSelect` callback
- **THEN** photo expansion is disabled

#### Scenario: Selected photo shows checkmark
- **WHEN** `ExpandableThumb` has `selected={true}` in selection mode
- **THEN** a checkmark overlay is displayed in the corner of the thumbnail

### Requirement: Disabled Action Buttons Show Icon Only
The system SHALL hide text labels on disabled action buttons in the expanded photo view, displaying only the icon.

#### Scenario: Action button is disabled
- **WHEN** an action button in the expanded photo action bar is in a disabled state
- **THEN** the button shows only its icon without a text label
- **THEN** the button renders as a circle (round shape) instead of a pill
- **THEN** the button retains its disabled visual styling (reduced opacity, muted colors)

#### Scenario: Action button is enabled
- **WHEN** an action button in the expanded photo action bar is in an enabled state
- **THEN** the button shows both its icon and text label

### Requirement: Add Photo to Wave from Expanded View
The system SHALL display a wave action button in the expanded photo view's action bar that allows the user to assign the photo to a wave via a modal selector.

#### Scenario: User views own photo not in any wave
- **WHEN** the user expands their own photo that is not assigned to any wave
- **THEN** the action bar shows a "Add to Wave" button with a wave icon
- **THEN** tapping the button opens the wave selector modal

#### Scenario: User views own photo already in a wave
- **WHEN** the user expands their own photo that is assigned to a wave
- **THEN** the action bar shows the wave name on the button instead of "Add to Wave"
- **THEN** tapping the button opens the wave selector modal with the current wave highlighted

#### Scenario: User views another user's photo
- **WHEN** the user expands a photo taken by a different device UUID
- **THEN** the wave action button is visually disabled
- **THEN** tapping the disabled button shows a toast: "Only your own photos can be added to waves"

#### Scenario: User assigns photo to a wave from expanded view
- **WHEN** the user selects a wave in the modal from the expanded photo view
- **THEN** `addPhotoToWave` mutation is called with the selected wave and photo
- **THEN** the action button label updates immediately to show the selected wave name
- **THEN** a success toast confirms the assignment

#### Scenario: User switches photo to a different wave
- **WHEN** the photo is already in a wave and the user selects a different wave
- **THEN** the photo is moved to the new wave (backend enforces single-wave)
- **THEN** the button label updates to the new wave name

#### Scenario: User removes photo from wave via expanded view
- **WHEN** the photo is in a wave and the user selects "None (remove from wave)" in the modal
- **THEN** `removePhotoFromWave` mutation is called
- **THEN** the button label reverts to "Add to Wave"
- **THEN** a success toast confirms removal

#### Scenario: Wave assignment fails
- **WHEN** the wave assignment mutation fails due to network or server error
- **THEN** the button label reverts to its previous state
- **THEN** an error toast is shown

### Requirement: Photo Details Include Wave Information
The system SHALL include wave membership data in the `getPhotoDetails` GraphQL query response.

#### Scenario: Photo is in a wave
- **WHEN** `getPhotoDetails` is queried for a photo that belongs to a wave
- **THEN** the response includes `waveName` (the wave's name) and `waveUuid` (the wave's identifier)

#### Scenario: Photo is not in any wave
- **WHEN** `getPhotoDetails` is queried for a photo not in any wave
- **THEN** the response includes `waveName: null` and `waveUuid: null`
