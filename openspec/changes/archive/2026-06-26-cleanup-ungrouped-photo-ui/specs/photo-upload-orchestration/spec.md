## MODIFIED Requirements

### Requirement: Upload completion does not fetch ungrouped photo count
The system SHALL NOT call `getUngroupedPhotosCount` API when photo upload completes. The upload completion handler SHALL only trigger a waves feed refresh via `handleRefresh()`.

#### Scenario: Upload complete event
- **WHEN** a photo upload completes successfully
- **THEN** the system SHALL call `handleRefresh()` to refresh the waves feed
- **THEN** the system SHALL NOT call `getUngroupedPhotosCount`

#### Scenario: No ungrouped count badge update needed
- **WHEN** upload completes
- **THEN** no ungrouped photo count badge update shall be performed
- **THEN** the `ungroupedPhotosCount` Jotai atom shall remain unchanged

## REMOVED Requirements

### Requirement: Flush ungrouped photos after upload
**Reason**: Auto-grouping is now server-side only; client-side flush of ungrouped photos is no longer needed.
**Migration**: Auto-grouping is triggered server-side after upload via `onPhotoUploadComplete` subscription notification.