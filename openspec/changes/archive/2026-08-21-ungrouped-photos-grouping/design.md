## Context

The Waves Hub (`src/screens/WavesHub/index.js`) renders waves as a flat `FlatList` of `WaveCard`s with `ListHeaderComponent` currently set to `null`. The `UngroupedPhotosCard` component existed previously (rendered as that header) but was removed in `2026-06-26-cleanup-ungrouped-photo-ui`, leaving the component file behind but unused. The backend auto-groups photos on upload via S3 events (`autoGroupPhotosIntoWaves`); the mutation is still client-callable on demand but has no per-photo scoping. Manual grouping is possible via `addPhotoToWave`, and `WaveSelectorModal` already supports creating a wave and picking an existing one.

## Goals / Non-Goals

**Goals:**
- Restore the ungrouped-photos card as the Waves Hub list header when the count is > 0, reusing the existing `UngroupedPhotosCard` + `WavePhotoStrip` + `feedForUngrouped` plumbing.
- Give users an explicit grouping path for the overflow that auto-grouping does not touch: server "Auto-Group everything" plus a manual "Create a wave" / "Add to an existing wave" path that moves only the photos the user selected.
- Surface the card after wave deletion, which is the primary edge case where photos re-enter the ungrouped pool.

**Non-Goals:**
- No changes to `autoGroupPhotosIntoWaves` or any backend behavior (see proposal — **No backend changes**).
- The auto-group action always covers the whole pool; per-photo selection only gates the manual path.
- No per-photo grouping on the server (no new `autoGroupPhotosIntoWaves([photoIds])` API).
- No redesign of `WaveSelectorModal`, `WaveCard`, or the waves search/pagination flow.

## Decisions

### Decision 1: Reuse `UngroupedPhotosCard` as a restored, not rebuilt, component
The component file `src/components/UngroupedPhotosCard/index.js` still exists and already renders the accent/dashed card with a `WavePhotoStrip` fed by `requestUngroupedPhotos`. We restore it as `ListHeaderComponent` rather than building a new card, adding only a selection layer and an action bar.
*Alternatives considered*: building a fresh header component in WavesHub. Rejected because it would duplicate the strip, pagination, and identity-change refetch logic already in `UngroupedPhotosCard`.

### Decision 2: Selection mode lives on the card, action bar gated by selection
`UngroupedPhotosCard` owns `selectionMode` and a `Set` of selected photo IDs. The toolbar ("Select All", count, "Cancel") and the three-action bar live inside the card. "Auto-Group everything" is always enabled; "Create a wave" and "Add to an existing wave" are disabled while the selection is empty.
*Rationale*: keeps selection state encapsulated in one component and matches Path 3 (the agreed design). The manual actions only make sense once the user has picked photos, so gating them on a non-empty selection is the natural UX.

### Decision 3: `WavePhotoStrip` gains optional selection props
`WavePhotoStrip` is extended with optional `selectionMode`, `selected` (a `Set` of photo IDs), and `onPhotoToggle(photoId)` props. When absent, the strip behaves exactly as today (no checkbox overlay). This keeps the strip backward compatible for `WaveCard`, which already passes it.
*Alternatives considered*: a wrapper component around the strip. Rejected because the strip already knows how to render thumbnails; a checkbox overlay is a thin presentation concern best placed on the strip itself.

### Decision 4: Auto-group uses the existing client-callable mutation
"Auto-Group everything" calls `autoGroupPhotosIntoWaves(uuid, groupingLevel)` via a new reducer function (verified client-callable; not removed by the 2026-06-26 server-side change). It clusters the whole pool server-side, ignoring selection, then refreshes the ungrouped count.
*Rationale*: simplest correct server behavior; the whole-pool cluster is exactly what "let the system decide" means. No new backend API is needed or wanted.

### Decision 5: Manual grouping loops `addPhotoToWave` over selected IDs
After the user picks/creates a wave from `WaveSelectorModal`, WavesHub calls `addPhotoToWave` once per selected photo ID, then refreshes the count. `WaveSelectorModal` is reused as-is for the create + pick-existing UX.
*Rationale*: `addPhotoToWave` already exists and handles the photo→wave association; a loop is the minimal manual path. For a large selection this is N mutations, which is acceptable given manual selection is typically small.

## Risks / Trade-offs

- [N mutations for a large manual selection] → Mitigation: manual selection is a deliberate, usually-small action; document that "Create a wave" batches selected photos and note batching (e.g. a server-side bulk add) as a future follow-up if large selections appear.
- [Selection state in `WavePhotoStrip`] → Mitigation: selection props are optional and default to disabled, so existing callers (`WaveCard`) are unaffected; guard against selection on a photo not in the current strip page.
- [Auto-group ignores selection] → Mitigation: the action is labelled "everything" and is always available, so scope is unambiguous.
- [Count refresh cadence] → Mitigation: refresh the count on all pool-changing events (focus, upload, auto-group, delete); a missed refresh only delays card appearance, never corrupts data.

## Open Questions

- Should "Auto-Group everything" show a confirmation dialog (matching the historical auto-group flow) or group immediately? Recommend a confirmation dialog to prevent accidental whole-pool grouping.
- Does the manual "Create a wave" need to preset the wave's geocoding (lat/lon/radius) from the selected photos, or let `WaveSelectorModal`'s create flow handle defaults?
