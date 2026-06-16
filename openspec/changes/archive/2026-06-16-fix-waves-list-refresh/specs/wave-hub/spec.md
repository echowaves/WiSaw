## MODIFIED Requirements

### Requirement: Waves Badge Updates
The system SHALL update badge counts and refresh the waves list when auto-grouping completes. For upload completions, the system SHALL only update the ungrouped photo count badge. Auto-group SHALL call `handleRefresh()` to reload the waves list (showing newly grouped photos), while upload SHALL call only `getUngroupedPhotosCount()` for a lightweight badge update.

#### Scenario: Waves list refreshes after auto-group completes
- **WHEN** the auto-group operation completes and `emitAutoGroupDone()` is called
- **THEN** the WavesHub component SHALL have a `subscribeToAutoGroupDone()` listener registered
- **THEN** the listener SHALL call `handleRefresh()` to reload the waves list from the server
- **THEN** the waves list SHALL show newly grouped photos in their correct waves
- **THEN** the ungrouped photos badge SHALL reflect the updated count (already set by `runAutoGroup()` via `setUngroupedPhotosCount(result.photosRemaining)`)

#### Scenario: Badge updates after upload completes
- **WHEN** a photo upload completes and `emitUploadComplete()` is called
- **THEN** the WavesHub component SHALL have a `subscribeToUploadComplete()` listener registered
- **THEN** the listener SHALL call `getUngroupedPhotosCount({ uuid })` to update only the ungrouped count badge
- **THEN** the waves list SHALL NOT be reloaded (no waves changed during upload)
- **THEN** the badge on the auto-group button SHALL display the updated ungrouped count
