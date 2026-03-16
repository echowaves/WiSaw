# Photo Upload Specification

## Purpose
Photo upload enables users to capture or select images and upload them to the WiSaw platform with automatic compression, parallel processing, queue management, and location tagging. This is the primary content creation mechanism of the app.

## Requirements

### Requirement: Camera Photo Capture
The system SHALL allow users to take photos directly with their device camera for immediate upload.

#### Scenario: User takes a photo
- **WHEN** the user taps the camera button and captures a photo
- **THEN** the photo is added to the upload queue with location metadata attached

#### Scenario: Camera permission not granted
- **WHEN** the user attempts to use the camera without granting permission
- **THEN** the system prompts for camera permission with an explanation of why it is needed

### Requirement: Photo Library Selection
The system SHALL allow users to select and upload images from their device photo library.

#### Scenario: User selects from library
- **WHEN** the user taps the library button and selects one or more images
- **THEN** the selected images are added to the upload queue

#### Scenario: Photo library permission not granted
- **WHEN** the user attempts to access the photo library without permission
- **THEN** the system prompts for photo library access with an explanation

### Requirement: Automatic Image Compression
The system SHALL automatically compress images to JPEG format at 0.85 quality before uploading to reduce bandwidth and improve upload speed.

#### Scenario: Photo is queued for upload
- **WHEN** a photo is added to the upload queue
- **THEN** it is compressed to JPEG at 0.85 quality before the upload begins

### Requirement: Parallel Upload Processing
The system SHALL process up to 3 photos simultaneously with up to 2 concurrent uploads for optimized throughput.

#### Scenario: Multiple photos queued
- **WHEN** multiple photos are in the upload queue
- **THEN** up to 3 photos are processed in parallel and up to 2 are uploaded concurrently

### Requirement: Upload Queue Management
The system SHALL maintain a reliable upload queue with automatic retry (up to 3 attempts) using exponential backoff on failure.

#### Scenario: Upload fails due to network error
- **WHEN** a photo upload fails
- **THEN** the system retries up to 3 times with exponential backoff between attempts

#### Scenario: All retries exhausted
- **WHEN** a photo upload fails after 3 retry attempts
- **THEN** the upload is marked as failed and the user is notified

### Requirement: Pending Uploads Status Indicator
The system SHALL display a visual status card showing the number of pending uploads and their progress.

#### Scenario: Uploads are in progress
- **WHEN** one or more photos are being uploaded
- **THEN** a pending uploads indicator shows the count and current upload progress

#### Scenario: All uploads complete
- **WHEN** all queued uploads finish successfully
- **THEN** the pending uploads indicator is hidden

### Requirement: Location Metadata Attachment
The system SHALL attach GPS coordinates to uploaded photos when location permission has been granted.

#### Scenario: Location permission is granted
- **WHEN** the user uploads a photo with location access enabled
- **THEN** the photo is tagged with the device's current GPS coordinates

#### Scenario: Location permission is denied
- **WHEN** the user uploads a photo without location access
- **THEN** the photo is uploaded without location metadata

### Requirement: Wave-Tagged Photo Uploads
The system SHALL attach a wave UUID to uploaded photos when an upload target wave is set, using the `uploadTargetWave` atom instead of the deprecated `activeWave` atom.

#### Scenario: Upload target wave is set
- **WHEN** the user captures or selects a photo for upload and `uploadTargetWave` is set
- **THEN** the photo is queued with the `uploadTargetWave.waveUuid`
- **THEN** after upload, `addPhotoToWave` mutation is called to associate the photo with the target wave

#### Scenario: No upload target wave set
- **WHEN** the user captures or selects a photo and no `uploadTargetWave` is set
- **THEN** the photo is uploaded without any wave association

#### Scenario: Upload target wave changed mid-queue
- **WHEN** photos are already queued with a wave UUID and the user changes the upload target
- **THEN** previously queued photos retain their original wave UUID
- **THEN** newly queued photos use the updated upload target wave UUID
