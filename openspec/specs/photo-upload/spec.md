## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for photo upload in WiSaw.

## Requirements

### Requirement: Wave-Tagged Photo Uploads
The system SHALL attach a wave UUID to uploaded photos when a `waveUuid` is provided by the screen context (e.g., the Wave Detail footer camera). Upload completion notifications SHALL be broadcast via the upload event bus with the queue item's `waveUuid` metadata, replacing per-screen `onPhotoUploaded` callbacks.

#### Scenario: Photo captured from wave detail screen
- **WHEN** the user captures or selects a photo from a screen that provides a `waveUuid` context
- **THEN** the photo is queued with that `waveUuid`
- **THEN** after upload, `addPhotoToWave` mutation is called to associate the photo with the wave
- **THEN** the upload bus SHALL emit `{ photo, waveUuid }` with the queue item's `waveUuid`

#### Scenario: Photo captured from main feed
- **WHEN** the user captures or selects a photo from the main feed (no `waveUuid` context)
- **THEN** the photo is uploaded without any wave association
- **THEN** the upload bus SHALL emit `{ photo, waveUuid: undefined }`

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

### Requirement: Upload queue removal by stable key
A successfully uploaded queue item SHALL be removed from the upload queue exactly once, identified by its stable `photoId`, regardless of how the stored queue entry was enriched during processing (e.g., added local file URLs or the created photo record). The upload completion event for an item SHALL be emitted exactly once per successful upload.

#### Scenario: Item removed after successful upload despite enrichment
- **WHEN** a queue item is processed, its stored queue entry is replaced with an enriched version during processing
- **AND** the S3 upload and photo creation succeed
- **THEN** the item SHALL be removed from the queue by its `photoId`
- **THEN** the item SHALL NOT be processed a second time in the same queue pass
- **THEN** exactly one upload completion event SHALL be emitted for the item

#### Scenario: Re-processed item does not evict a dimensioned feed entry
- **WHEN** a photo is returned from the upload pipeline in the "already active" state (created earlier, backend processing finished)
- **THEN** the returned photo SHALL carry valid `width` and `height` values
- **THEN** the emitted upload completion event SHALL contain a photo with valid dimensions in every pipeline outcome (newly created, inactive re-upload, and already-active)

### Requirement: Photo lookup returns dimensions
The upload pipeline's photo lookup (by photo ID and device UUID) SHALL return the photo's `width` and `height` when the backend has populated them, so that any pipeline path returning an existing photo emits a fully dimensioned photo to the upload event bus.

#### Scenario: Lookup of a fully processed photo
- **WHEN** the upload pipeline looks up a photo whose backend processing has completed (dimensions stored)
- **THEN** the lookup result SHALL include numeric `width` and `height`

#### Scenario: Lookup of a not-yet-processed photo
- **WHEN** the upload pipeline looks up a photo whose backend processing has not yet stored dimensions
- **THEN** the lookup result MAY include null or missing `width`/`height`
- **THEN** the pipeline SHALL fall back to local dimension extraction for the emitted photo

### Requirement: Captured media is saved to the device library
When the user captures a photo or video, the capture flow SHALL save the captured file to the device's media library using the current `expo-media-library` API (not the removed legacy `saveToLibraryAsync` function). The save SHALL be best-effort: a save failure SHALL be logged but SHALL NOT abort or delay the upload pipeline — the photo SHALL still be enqueued for upload. Only the live shared camera capture hook SHALL perform the save; no duplicated or orphaned copy of the hook SHALL exist.

#### Scenario: Capture saved to library successfully
- **WHEN** the user captures a photo with camera and media-library permissions granted
- **AND** the media library save succeeds
- **THEN** a new entry SHALL appear in the device photo library for the captured file
- **THEN** the photo SHALL also be enqueued for upload to WiSaw

#### Scenario: Library save failure does not block upload
- **WHEN** the user captures a photo and the media library save fails (e.g., storage full, permission revoked mid-session)
- **THEN** the failure SHALL be logged
- **THEN** the photo SHALL still be enqueued for upload to WiSaw
- **THEN** no deprecation or "method removed" error SHALL be logged for the save call

#### Scenario: No dead duplicate hook with a save call
- **WHEN** the codebase is inspected
- **THEN** exactly one camera capture hook SHALL exist (`src/hooks/useCameraCapture.js`)
- **THEN** the media library save SHALL occur only in that hook
