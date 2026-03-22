## MODIFIED Requirements

### Requirement: Quick Actions Modal — Wave Action
The system SHALL open the WaveSelectorModal on top of the quick-actions modal when the user taps the Wave button. When the user removes a photo from its wave or moves a photo to a different wave, the system SHALL close the QuickActionsModal immediately and notify the parent via callback.

#### Scenario: User taps Wave on own photo
- **WHEN** the user taps the Wave button on their own photo in the quick-actions modal
- **THEN** the WaveSelectorModal opens on top of the quick-actions modal
- **THEN** the quick-actions modal stays visible behind the wave selector

#### Scenario: User taps Wave on another user's photo
- **WHEN** the user taps the Wave button on a photo not owned by them
- **THEN** a toast shows "Only your own photos can be added to waves"
- **THEN** the modal stays open

#### Scenario: User removes photo from wave via quick-actions modal
- **WHEN** the user selects "None (remove from wave)" in the WaveSelectorModal
- **THEN** the WaveSelectorModal closes
- **THEN** the QuickActionsModal closes immediately (optimistic)
- **THEN** `onPhotoRemovedFromWave` callback is called with the photo ID
- **THEN** `removePhotoFromWave` mutation is called
- **THEN** a success toast confirms removal

#### Scenario: User moves photo to different wave via quick-actions modal
- **WHEN** the user selects a different wave in the WaveSelectorModal
- **THEN** the WaveSelectorModal closes
- **THEN** the QuickActionsModal closes immediately (optimistic)
- **THEN** `onPhotoRemovedFromWave` callback is called with the photo ID
- **THEN** `addPhotoToWave` mutation is called for the new wave
- **THEN** a success toast confirms the move

#### Scenario: Remove from wave mutation fails
- **WHEN** the `removePhotoFromWave` mutation fails after the modal has closed
- **THEN** an error toast is shown
- **THEN** the photo remains removed from the local list (corrected on next focus refresh)

#### Scenario: Move to wave mutation fails
- **WHEN** the `addPhotoToWave` mutation fails after the modal has closed
- **THEN** an error toast is shown
- **THEN** the photo remains removed from the local list (corrected on next focus refresh)

#### Scenario: onPhotoRemovedFromWave not provided
- **WHEN** the QuickActionsModal is rendered without the `onPhotoRemovedFromWave` prop (e.g. in PhotosList)
- **THEN** wave remove and move actions SHALL still close the WaveSelectorModal and QuickActionsModal
- **THEN** mutations and toasts SHALL still fire normally
- **THEN** no parent list filtering occurs
