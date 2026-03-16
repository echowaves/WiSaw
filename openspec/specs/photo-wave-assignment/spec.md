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
The system SHALL allow users to add a photo to an existing wave via long-press context menu in the main photo feed.

#### Scenario: User long-presses a photo in the feed
- **WHEN** the user long-presses a photo in the main feed
- **THEN** a context menu appears including "Add to Wave..." option

#### Scenario: User selects "Add to Wave..."
- **WHEN** the user taps "Add to Wave..."
- **THEN** a wave picker list is shown with all available waves and a search field
- **THEN** the user selects a wave
- **THEN** `addPhotoToWave` mutation is called for the photo and selected wave
- **THEN** a success toast confirms the photo was added

### Requirement: Create New Wave from Photo
The system SHALL allow users to create a new wave and immediately add the current photo to it via long-press context menu.

#### Scenario: User selects "Start New Wave" from photo context menu
- **WHEN** the user long-presses a photo and selects "Start New Wave"
- **THEN** a create wave modal appears with name and description fields
- **THEN** upon creation, the new wave is created via `createWave` mutation
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
