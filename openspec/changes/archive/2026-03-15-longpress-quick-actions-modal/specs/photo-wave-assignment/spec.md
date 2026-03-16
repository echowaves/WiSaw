## MODIFIED Requirements

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
