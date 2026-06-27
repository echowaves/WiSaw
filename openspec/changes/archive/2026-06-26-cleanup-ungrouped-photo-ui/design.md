## Context

Auto-grouping was previously a client-side feature that users could configure. It has been moved server-side with a hardcoded grouping level of "CITY" (see `2026-06-19-server-side-auto-grouping` change). The server now automatically groups photos after upload and notifies clients via `onPhotoUploadComplete` GraphQL subscription.

However, several client-side UI elements still reference "ungrouped photos" — a concept that no longer applies from the user's perspective since the server handles all organization automatically.

### Current State

**UngroupedPhotosCard** (`src/components/UngroupedPhotosCard/index.js`):
- Displayed in WavesHub `ListHeaderComponent` when `ungroupedCount > 0`
- Shows a photo strip of ungrouped photos with count badge
- Fetches photos via `feedForUngrouped` GraphQL query
- Re-fetches on identity change events

**Badge displays** (3 locations):
1. WavesHub kebab menu — red badge with numeric count
2. WaveHeaderIcon — red dot badge
3. Waves drawer icon — red dot badge

**API calls** to `getUngroupedPhotosCount`:
- WavesHub: on upload complete + autoGroupDone events
- WaveHeaderIcon: on mount + autoGroupDone events

## Goals / Non-Goals

**Goals:**
- Remove all UI elements that reference "ungrouped photos" concept
- Update initial screen messaging to clearly explain auto-grouping behavior
- Eliminate unnecessary `getUngroupedPhotosCount` API calls
- Preserve wave count-based badges (they still serve a purpose)

**Non-Goals:**
- Removing the `ungroupedPhotosCount` Jotai atom (may be used elsewhere, preserve for safety)
- Removing the `getUngroupedPhotosCount` reducer function (server may still need it, preserve for safety)
- Removing `UngroupedPhotosCard` component file entirely (just stop using it)
- Modifying server-side auto-grouping behavior

## Decisions

### Decision 1: Remove UngroupedPhotosCard from ListHeaderComponent
**Choice**: Set `ListHeaderComponent={null}` unconditionally in WavesHub FlatList.

**Rationale**: The card was designed for the old client-side auto-grouping workflow where users needed visibility into ungrouped photos. Since the server now handles this transparently, users have no need to see or interact with ungrouped photos. The card's presence is confusing — it shows photos that are "waiting to be grouped" when grouping happens automatically.

**Alternative considered**: Keep the card but make it informational-only. Rejected — adds no value in the server-side model.

### Decision 2: Update WavesExplainerView messaging
**Choice**: Change `NO_PHOTOS_CARDS` to emphasize that photos are automatically added to waves when taken.

**Rationale**: New users need to understand the core value proposition — take photos, they get organized automatically. The current messaging ("Start by Taking Photos") doesn't convey that waves are created automatically.

**Proposed text changes**:
- Subtitle: "Take photos to start building your wave collection" → "Your first photos will be automatically organized into a new wave."
- Camera card body: "Take photos and they will be automatically grouped into waves. Each photo captures a time and location that helps organize them." → "Take photos and they'll be automatically placed into a wave based on when and where they were taken — no manual setup needed."
- Remove the "Two Ways to Add Photos" card as it references a manual workflow that's no longer relevant.

### Decision 3: Remove ungrouped count from all badge displays
**Choice**: Badges should only reflect waves count activity, not ungrouped photo count.

**Rationale**: The original badge logic showed activity when either waves existed OR ungrouped photos were present. Since ungrouped photos no longer exist as a user-visible concept, only waves count matters.

**Changes per location**:

| Component | Current Logic | New Logic |
|-----------|--------------|-----------|
| WavesHub kebab menu | Show badge when `ungroupedCount > 0` | Always hide (remove badge entirely) |
| WaveHeaderIcon | Show red dot when `ungroupedCount > 0` OR `wavesCount > 0` | Show red dot when `wavesCount > 0` only |
| Waves drawer icon | Show red dot when `ungroupedCount > 0` OR `wavesCount > 0` | Show red dot when `wavesCount > 0` only |

### Decision 4: Remove `getUngroupedPhotosCount` API calls
**Choice**: Remove all client-side calls to `getUngroupedPhotosCount`.

**Rationale**: If the count isn't displayed, there's no reason to fetch it. This eliminates unnecessary network requests on:
- Upload complete events
- Auto-group done events  
- WaveHeaderIcon mount
- WaveHeaderIcon auto-group done events

**Impact**: The `ungroupedPhotosCount` Jotai atom will remain at its default `null` value. This is harmless — no code will read it since all consumers are being updated to not check it.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| `ungroupedPhotosCount` atom still exists but never set | Harmless — atom stays at null, no code reads it after changes |
| `getUngroupedPhotosCount` reducer function orphaned | Low risk — function remains callable if needed later, no cleanup cost |
| `UngroupedPhotosCard` component orphaned | Low risk — component file remains, just not imported anywhere |
| Users expecting "ungrouped" visibility | Not a regression — this visibility never existed in the server-side model |

## Migration Plan

1. Deploy all changes together as a single update
2. No server-side changes required
3. No data migration needed
4. Rollback: Revert client build if unexpected issues arise

## Open Questions

None — all decisions made based on existing context and codebase investigation.