## ADDED Requirements

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
