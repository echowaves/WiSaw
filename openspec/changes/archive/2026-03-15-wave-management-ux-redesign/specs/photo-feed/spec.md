## MODIFIED Requirements

### Requirement: Photo Interaction from Feed
The system SHALL allow users to tap on a photo in the feed to view its details, including comments, AI labels, and sharing options. The system SHALL also allow users to long-press a photo to access a context menu with wave-related actions.

#### Scenario: User taps a photo
- **WHEN** the user taps on a photo tile in the masonry grid
- **THEN** the photo detail view is presented with full-size image and metadata

#### Scenario: User long-presses a photo
- **WHEN** the user long-presses a photo tile in the masonry grid
- **THEN** a context menu appears with options including "Add to Wave..." and "Start New Wave"

#### Scenario: User selects "Add to Wave..." from context menu
- **WHEN** the user selects "Add to Wave..." from the photo context menu
- **THEN** a wave picker is shown listing available waves with search
- **THEN** selecting a wave calls `addPhotoToWave` and shows a success toast

#### Scenario: User selects "Start New Wave" from context menu
- **WHEN** the user selects "Start New Wave" from the photo context menu
- **THEN** a create wave modal appears
- **THEN** upon creation, the photo is automatically added to the new wave
