## Context

Auto-grouping has been moved server-side (change `2026-06-19-server-side-auto-grouping`). The server now:
1. Runs `autoGroupPhotosIntoWaves(uuid, 'CITY')` after every photo upload in the `processUploadedImage` Lambda
2. Notifies clients via GraphQL subscription `onPhotoUploadComplete(photoId: String!)` with `@aws_subscribe(mutations: ["_notifyPhotoUploadComplete"])`

The client still has auto-grouping code (settings screen, grouping atom, manual invocation functions, progress modal) that is now redundant. This change removes all client-side auto-grouping code and wires up the subscription to refresh the UI.

## Goals / Non-Goals

**Goals:**
- Remove all client-side auto-grouping invocation code and UI
- Remove grouping settings screen and navigation
- Wire up `onPhotoUploadComplete` subscription in WavesHub to refresh feed after upload+grouping
- Clean up unused event bus functions and guards
- Preserve `subscribeToAutoGroupDone`/`emitAutoGroupDone` for wave delete flow

**Non-Goals:**
- No changes to server-side code (already deployed in `2026-06-19-server-side-auto-grouping`)
- No new dependencies
- No changes to existing grouping atom/storage (kept for WaveHeaderIcon toggle visibility)
- No migration plan needed — purely client-side cleanup

## Decisions

### Decision 1: Subscribe to `onPhotoUploadComplete` without variables
**Choice**: Subscribe without any variables in the subscription query.

**Rationale**: The server schema defines `onPhotoUploadComplete(photoId: String!)` but the `photoId` is an input to the mutation `_notifyPhotoUploadComplete`, not a filter. The server calls `_notifyPhotoUploadComplete(photoId, photosGrouped)` for each user's upload. Since the AppSync API key authentication is per-app-instance (not per-user), the client receives notifications for all uploads. However, in practice only the uploading user's client will have the photo in its upload queue, so false positives are unlikely. If needed, the server can add a `uuid` filter later.

**Alternatives considered**:
- Add `uuid` variable to subscription — server schema doesn't support this yet
- Filter notifications client-side — adds complexity, not needed for now

### Decision 2: Keep `groupingAtom` and `groupingStorage`
**Choice**: Leave `src/utils/groupingAtom.js` and `src/utils/groupingStorage.js` untouched.

**Rationale**: `WaveHeaderIcon` component uses `groupingAtom` to determine whether to show the toggle icon. Removing these would require changes to that component which is out of scope. Storage files may still be referenced elsewhere.

### Decision 3: Simplify `autoGroupBus.js` selectively
**Choice**: Remove `emitAutoGroup`, `subscribeToAutoGroup`, `emitAutoGroupSilent` but keep `subscribeToAutoGroupDone` and `emitAutoGroupDone`.

**Rationale**: `emitAutoGroupDone` is still called by `handleDeleteWave` in WavesHub to signal that wave deletion may have created ungrouped photos. `subscribeToAutoGroupDone` is used by `UngroupedPhotosCard` and `WaveHeaderIcon` to refresh after auto-group completes.

### Decision 4: WavesExplainerView CTA behavior
**Choice**: Replace the "Auto-Group" button with informational text stating auto-grouping is automatic.

**Rationale**: The "Ungrouped Photos" section in the explainer currently has a button that calls `emitAutoGroup(ungroupedCount)`. Since auto-grouping is now server-side, this button is misleading. Replace with text explaining that photos are automatically grouped when uploaded.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Subscription fires for other users' uploads | In practice, only the uploading client has the photo in its queue. If problematic, server can add `uuid` filter to subscription. |
| Accidentally removing `subscribeToAutoGroupDone` used by other components | Carefully audit all references before removing from `autoGroupBus.js` |
| `groupingAtom` still has `groupingLevel: 'CITY'` in client state but unused | Harmless — client state is stale but never read. Safe to clean up later. |
| WavesExplainerView change removes useful UX cue | User can still see ungrouped photos count badge; grouping happens automatically on upload. |

## Migration Plan

No deployment or migration needed. This is a pure client-side cleanup:
1. Delete unused files
2. Remove code references
3. Add subscription listener
4. Test: upload a photo → verify WavesHub feed refreshes after upload completes
5. Test: navigate to waves screen → verify no grouping settings button
6. Test: delete a wave → verify ungrouped count still updates correctly