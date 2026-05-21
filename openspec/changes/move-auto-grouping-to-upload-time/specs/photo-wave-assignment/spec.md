## MODIFIED Requirements

### Requirement: Create New Wave from Photo
The system SHALL allow users to create a new wave and immediately add the current photo to it via the quick-actions modal or expanded photo view. **MODIFIED**: When grouping is enabled, photos captured at upload time are also assigned to waves automatically — either the current active wave (if location fits) or a newly created one (if drifted).

#### Scenario: User creates a new wave from quick-actions modal
- **WHEN** the user taps the Wave button in the quick-actions modal
- **THEN** the WaveSelectorModal opens with all available waves and a search field
- **WHEN** the user taps "Create New Wave" and enters a name
- **THEN** the new wave is created via `createWave` mutation
- **THEN** the photo is immediately added to the new wave via `addPhotoToWave` mutation
- **THEN** a success toast confirms wave creation and photo assignment

#### Scenario: Auto-assigned wave at upload time (new)
- **WHEN** grouping is enabled and a user captures a photo
- **AND** the photo's location fits within the current active wave
- **THEN** the photo SHALL be automatically assigned to the active wave during upload (no manual action needed)

#### Scenario: Auto-created wave at upload time due to drift (new)
- **WHEN** grouping is enabled and a user captures a photo
- **AND** the photo's location has drifted from the current active wave
- **THEN** a new wave SHALL be automatically created during upload with an auto-generated name
- **THEN** the photo SHALL be assigned to this newly created wave

### Requirement: Photo Details Include Wave Information
The system SHALL include wave membership data in the `getPhotoDetails` GraphQL query response. **MODIFIED**: Photos captured while grouping is enabled are always assigned a wave on first upload — there is no "ungrouped" state for uploaded photos when grouping is active.

#### Scenario: Photo is in a wave
- **WHEN** `getPhotoDetails` is queried for a photo that belongs to a wave
- **THEN** the response includes `waveName` (the wave's name) and `waveUuid` (the wave's identifier)

#### Scenario: Photo is not in any wave
- **WHEN** `getPhotoDetails` is queried for a photo not in any wave
- **AND** grouping is disabled
- **THEN** the response includes `waveName: null` and `waveUuid: null`
