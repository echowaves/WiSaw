## ADDED Requirements

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
