## REMOVED Requirements

### Requirement: Upload Target Bar Display
**Reason**: The upload target concept is being removed entirely. Users no longer set a persistent upload target wave.
**Migration**: Users navigate to a wave detail screen and use the camera footer there to upload photos to a specific wave.

## MODIFIED Requirements

### Requirement: Wave Card Context Menu
The system SHALL show a context menu on long-press of a wave card with management options.

#### Scenario: Owner long-presses their own wave card
- **WHEN** the wave owner long-presses a wave card
- **THEN** a context menu appears with options: Rename, Edit Description, Share Wave, Delete Wave

#### Scenario: User deletes a wave from context menu
- **WHEN** the user selects Delete Wave from the context menu
- **THEN** a confirmation dialog is shown
- **THEN** upon confirmation, the wave is deleted and removed from the grid
