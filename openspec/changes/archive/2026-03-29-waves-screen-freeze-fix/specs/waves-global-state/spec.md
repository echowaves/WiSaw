## MODIFIED Requirements

### Requirement: Local atom updates at mutation sites
The system SHALL update `wavesCount` and `ungroupedPhotosCount` atoms directly at mutation call sites, without additional backend queries. Components that only write to these atoms (never render based on their value) SHALL use `useSetAtom` instead of `useAtom` to avoid unnecessary re-render subscriptions.

#### Scenario: Photo uploaded without wave assignment
- **WHEN** a photo upload completes and `waveUuid` is undefined
- **THEN** `ungroupedPhotosCount` SHALL be incremented by 1

#### Scenario: Photo uploaded to a specific wave
- **WHEN** a photo upload completes and `waveUuid` is defined
- **THEN** `ungroupedPhotosCount` SHALL NOT change

#### Scenario: Auto-group completes
- **WHEN** the auto-group process finishes with `totalWavesCreated` waves
- **THEN** `ungroupedPhotosCount` SHALL be set to 0
- **THEN** `wavesCount` SHALL be incremented by `totalWavesCreated`

#### Scenario: Wave created manually
- **WHEN** a new wave is successfully created via the create-wave modal
- **THEN** `wavesCount` SHALL be incremented by 1

#### Scenario: Wave deleted
- **WHEN** a wave with `photosCount` photos is successfully deleted
- **THEN** `wavesCount` SHALL be decremented by 1
- **THEN** `ungroupedPhotosCount` SHALL be incremented by the deleted wave's `photosCount`

#### Scenario: Photo added to wave manually
- **WHEN** a photo is successfully added to a wave via `addPhotoToWave`
- **THEN** `ungroupedPhotosCount` SHALL be decremented by 1 (floored at 0)

#### Scenario: Write-only consumers do not re-render on external writes
- **WHEN** a component uses only the setter for `wavesCount` or `ungroupedPhotosCount` (never reads the value)
- **THEN** it SHALL use `useSetAtom(atom)` instead of `useAtom(atom)`
- **THEN** it SHALL NOT re-render when another component writes to the same atom

### Requirement: Focus refresh re-syncs atoms
The system SHALL re-fetch both `getWavesCount` and `getUngroupedPhotosCount` from the backend when the waves screen gains focus, writing the results to the global atoms to correct any drift.

#### Scenario: Waves screen gains focus
- **WHEN** the waves index screen gains focus via `useFocusEffect`
- **THEN** the system SHALL call `getWavesCount({ uuid })` and `getUngroupedPhotosCount({ uuid })`
- **THEN** the results SHALL be written to the `wavesCount` and `ungroupedPhotosCount` atoms

### Requirement: Keyboard dismissed on PhotosList focus loss
The system SHALL dismiss the keyboard when PhotosList loses focus, preventing keyboard-animation conflicts with `KeyboardStickyView` / `KeyboardAvoidingView` in destination screens.

#### Scenario: User navigates away from PhotosList with keyboard active
- **WHEN** the PhotosList screen loses focus (useFocusEffect cleanup fires)
- **THEN** `Keyboard.dismiss()` SHALL be called immediately
- **THEN** the keyboard SHALL be fully dismissed before the destination screen mounts
