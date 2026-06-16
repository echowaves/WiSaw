## Why

The Waves screen has 4 bugs introduced by the June 15 "simplify" commit that removed event subscriptions:

1. **Waves list badge shows wrong ungrouped photo count after upload** - Badge doesn't update after upload completes
2. **Ungrouped photos card shows wrong count** - Card displays stale photo count after auto-group completes
3. **Ungrouped photos card thumbnails don't always show** - Thumbnails are missing because the component doesn't re-fetch after auto-group
4. **Newly grouped photos don't appear in waves until manual refresh** - Waves list doesn't update after auto-group completes

The June 15 commit removed ALL event subscriptions (including `subscribeToAutoGroupDone` and `subscribeToUploadComplete`), thinking they caused UI freezes. However, the lightweight badge updates (June 5-12) were safe and should have been kept.

## What Changes

- Restore `subscribeToAutoGroupDone()` and `subscribeToUploadComplete()` event listeners in WavesHub that call `fetchCounts()` for lightweight badge updates
- Restore `subscribeToAutoGroupDone()` event listener in UngroupedPhotosCard that resets the fetch guard and re-fetches photos
- Keep the `handleRefresh()` function but DO NOT call it from event listeners (to prevent UI freezes)

## Capabilities

### Modified Capabilities
- `wave-hub`: Add event listener for `subscribeToAutoGroupDone()` and `subscribeToUploadComplete()` that calls `fetchCounts()` for badge updates after auto-group and upload operations
- `ungrouped-photos-card`: Add event listener for `subscribeToAutoGroupDone()` that resets the `fetchedRef` guard and triggers re-fetch of ungrouped photos
- `auto-group-photos`: Badge update requirement already exists in spec, but implementation was removed in June 15 commit

## Impact

**Affected Files:**
- `src/screens/WavesHub/index.js` - Add event subscriptions for badge updates
- `src/components/UngroupedPhotosCard/index.js` - Add event subscription to reset fetch state

**No breaking changes** - Only restores previously working event handling logic.

**Performance considerations:**
- Badge updates are lightweight (single GraphQL query per badge)
- No waves list refresh from event listeners (that was what caused June 12 freezes)
- Re-fetch in UngroupedPhotosCard is a single network call after auto-group completes
