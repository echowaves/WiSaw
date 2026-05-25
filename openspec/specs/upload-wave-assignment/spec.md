# Upload Wave Assignment Specification

## Purpose
Wave assignment logic runs during photo upload (not capture time). Photos upload as ungrouped and are assigned to waves by the backend during auto-grouping. After the upload queue drains, the system flushes any pending ungrouped photos.

## Requirements

### Requirement: Flush ungrouped photos after upload queue drains
The system SHALL flush any pending ungrouped photos via `autoGroupPhotosIntoWaves` after all queued photos have been uploaded successfully, with a 5-second delay to allow backend processing. The flush SHALL NOT run during individual photo uploads. **When auto-grouping is disabled (`grouping.enabled === false`), the flush step SHALL be skipped entirely.** The flush SHALL NOT check the local upload queue for ungrouped items — the server determines which photos are ungrouped.

#### Scenario: Upload queue drains successfully — flush after delay
- **WHEN** the upload queue in `usePhotoUploader.processQueue` drains to zero items (all uploads succeeded)
- **AND** grouping is enabled
- **THEN** the system SHALL wait 5 seconds
- **THEN** the system SHALL call `flushUngroupedPhotos` to auto-group all uploaded photos

#### Scenario: Upload queue breaks due to network loss — no flush
- **WHEN** the upload queue processing exits early due to network unavailability
- **THEN** the system SHALL NOT call `flushUngroupedPhotos`
- **THEN** the flush SHALL be deferred until the queue is retried and fully drained

#### Scenario: Upload fails mid-queue — no flush
- **WHEN** a photo upload fails and the queue processing exits the loop
- **THEN** the system SHALL NOT call `flushUngroupedPhotos`

#### Scenario: Auto-grouping disabled — skip flush entirely
- **WHEN** all queued photos have been uploaded successfully
- **AND** grouping is disabled (`grouping.enabled === false`)
- **THEN** the system SHALL NOT call `flushUngroupedPhotos`

#### Scenario: No per-photo flush during upload
- **WHEN** `processCompleteUpload` is called for an individual photo
- **THEN** the system SHALL NOT call `flushUngroupedPhotos`
- **THEN** the photo SHALL be uploaded as ungrouped

#### Scenario: Flush calls server without local queue check
- **WHEN** `flushUngroupedPhotos` is called after queue drain
- **AND** grouping is enabled
- **THEN** the system SHALL call `autoGroupPhotos` on the server directly
- **THEN** the system SHALL NOT read the local upload queue as a precondition
