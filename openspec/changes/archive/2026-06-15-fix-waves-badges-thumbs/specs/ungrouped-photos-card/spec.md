## MODIFIED Requirements

### Requirement: Ungrouped Photos Card Displays Ungrouped Photos

**ADDED Requirements**: (restoring June 12 implementation)

#### Scenario: Card re-fetches after auto-group completes
- **WHEN** the auto-group operation completes and `emitAutoGroupDone()` is called
- **THEN** the UngroupedPhotosCard component SHALL have a `subscribeToAutoGroupDone()` listener registered
- **THEN** the listener SHALL reset `fetchedRef.current = false` to allow re-fetching
- **THEN** the listener SHALL call `requestUngroupedPhotos()` to fetch fresh ungrouped photos
- **THEN** the thumbnails SHALL display correctly (no more empty placeholders)

**REMOVED Requirements**: (June 15 "simplify" commit removed this)

### Requirement: Ungrouped Photos Card Auto-Group Listener

**Reason**: June 15 commit removed ALL event subscriptions including `subscribeToAutoGroupDone()`, causing stale photos and empty thumbnails after auto-group
**Migration**: Restore `subscribeToAutoGroupDone()` listener to reset `fetchedRef` and trigger re-fetch

---

## ADDED Requirements (Badge Update Propagation)

### Requirement: Ungrouped Photos Count Updates

#### Scenario: Ungrouped count updates after auto-group
- **WHEN** the auto-group operation completes and `emitAutoGroupDone()` is called
- **THEN** the `ungroupedPhotosCount` atom SHALL be updated via `fetchCounts()`
- **THEN** the UngroupedPhotosCard prop `ungroupedCount` SHALL reflect the new value
- **THEN** the card title SHALL display the updated count (e.g., "Ungrouped Photos (5)")
