## MODIFIED Requirements

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
