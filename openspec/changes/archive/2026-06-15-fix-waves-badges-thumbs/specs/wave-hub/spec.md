## MODIFIED Requirements

### Requirement: Waves Badge Updates

**ADDED Requirements**: (restoring June 12 implementation)

#### Scenario: Badge updates after auto-group completes
- **WHEN** the auto-group operation completes and `emitAutoGroupDone()` is called
- **THEN** the WavesHub component SHALL have a `subscribeToAutoGroupDone()` listener registered
- **THEN** the listener SHALL call `fetchCounts()` to update `ungroupedPhotosCount` and `wavesCount` atoms
- **THEN** the badge on the auto-group button SHALL display the updated count

#### Scenario: Badge updates after upload completes
- **WHEN** a photo upload completes and `emitUploadComplete()` is called
- **THEN** the WavesHub component SHALL have a `subscribeToUploadComplete()` listener registered
- **THEN** the listener SHALL call `fetchCounts()` to update `ungroupedPhotosCount` atom
- **THEN** the badge on the auto-group button SHALL display the updated count

**REMOVED Requirements**: (June 15 "simplify" commit removed these)

### Requirement: Waves List Refresh on Focus

**Reason**: June 15 commit removed event subscriptions entirely to prevent UI freezes, but this over-removed lightweight badge updates
**Migration**: Badge updates should only call `fetchCounts()` (lightweight), NOT `handleRefresh()` (heavy, caused June 12 freezes)

---

## ADDED Requirements (Ungrouped Photos Card Fix)

### Requirement: Ungrouped Photos Card Re-fetch After Auto-Group

#### Scenario: Card re-fetches after auto-group completes
- **WHEN** the auto-group operation completes and `emitAutoGroupDone()` is called
- **THEN** the UngroupedPhotosCard component SHALL have a `subscribeToAutoGroupDone()` listener registered
- **THEN** the listener SHALL reset `fetchedRef.current = false` to allow re-fetching
- **THEN** the listener SHALL call `requestUngroupedPhotos()` to fetch fresh ungrouped photos
- **THEN** the thumbnails SHALL display correctly (no more empty placeholders)
