## MODIFIED Requirements

### Requirement: Wave-Tagged Photo Uploads
The system SHALL attach a wave UUID to uploaded photos when a `waveUuid` is provided by the screen context (e.g., the Wave Detail footer camera).

#### Scenario: Photo captured from wave detail screen
- **WHEN** the user captures or selects a photo from a screen that provides a `waveUuid` context
- **THEN** the photo is queued with that `waveUuid`
- **THEN** after upload, `addPhotoToWave` mutation is called to associate the photo with the wave

#### Scenario: Photo captured from main feed
- **WHEN** the user captures or selects a photo from the main feed (no `waveUuid` context)
- **THEN** the photo is uploaded without any wave association

#### Scenario: Wave UUID is passed through footer
- **WHEN** the `PhotosListFooter` has a `waveUuid` prop set
- **THEN** photos captured from that footer's camera SHALL be tagged with that `waveUuid`

### Requirement: Geo Coordinate Validation at Upload Time
The system SHALL validate that queued photos have valid geo coordinates before submitting the `createPhoto` GraphQL mutation. Coordinates SHALL originate from the global `locationAtom` at capture time.

#### Scenario: Queued item has valid coordinates
- **WHEN** a queued photo has non-zero latitude and longitude in its location data (sourced from `locationAtom.coords` at capture time)
- **THEN** the upload SHALL proceed normally

#### Scenario: Queued item has null or missing location
- **WHEN** a queued photo has `null`, `undefined`, or missing location data
- **THEN** the upload SHALL be rejected
- **THEN** the item SHALL be removed from the upload queue
- **THEN** the user SHALL be shown an error message indicating the photo was skipped due to missing location

#### Scenario: Queued item has zero coordinates
- **WHEN** a queued photo has latitude and longitude both equal to 0
- **THEN** the upload SHALL be rejected
- **THEN** the item SHALL be removed from the upload queue
- **THEN** the user SHALL be shown an error message indicating the photo was skipped due to missing location

### Requirement: Camera Capture Location Source
The `useCameraCapture` hook SHALL read location from the global `locationAtom` instead of receiving it as a parameter.

#### Scenario: Camera capture with ready location
- **WHEN** the user captures a photo and `locationAtom.status` is `ready`
- **THEN** the coordinates from `locationAtom.coords` SHALL be used for the upload queue item

#### Scenario: Camera capture with unavailable location
- **WHEN** the user manages to trigger capture and `locationAtom.status` is not `ready`
- **THEN** a "Waiting for location..." toast SHALL be shown
- **THEN** the capture SHALL be blocked

### Requirement: Wave Detail Photo Upload Location
The system SHALL obtain valid GPS coordinates from the global `locationAtom` for photo capture in the Wave Detail screen. Wave browsing (viewing wave photos, navigating, editing) SHALL work normally regardless of location state.

#### Scenario: WaveDetail camera with location available
- **WHEN** the user opens WaveDetail and `locationAtom.status` is `ready`
- **THEN** camera and video buttons SHALL be enabled
- **THEN** photos captured from WaveDetail SHALL include coordinates from `locationAtom.coords`

#### Scenario: WaveDetail camera without location
- **WHEN** the user opens WaveDetail and `locationAtom.status` is `pending` or `denied`
- **THEN** camera and video buttons SHALL be visible but disabled (opacity 0.4)
- **THEN** wave browsing (photo grid, pagination, search, editing, merging) SHALL work normally
- **THEN** the `useLocationInit` hook SHALL NOT be called — location comes from the atom
