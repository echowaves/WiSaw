## ADDED Requirements

### Requirement: Original camera dimensions preferred for photo dimension extraction

When extracting image dimensions during upload, the system SHALL prefer dimensions from the original camera file over dimensions from compressed or resized derivative files.

#### Scenario: Original camera file is available

- **WHEN** `ensurePhotoDimensions` is called and `originalCameraUrl` exists and is readable
- **THEN** dimensions extracted from `originalCameraUrl` SHALL be used
- **AND** the photo object SHALL have `width` and `height` matching the original image

#### Scenario: Original camera file is unavailable but compressed file exists

- **WHEN** `ensurePhotoDimensions` is called and `originalCameraUrl` is missing or unreadable but `localImgUrl` is available
- **THEN** dimensions from `localImgUrl` SHALL be used as a fallback
