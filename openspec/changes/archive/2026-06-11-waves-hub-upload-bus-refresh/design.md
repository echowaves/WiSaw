## Context

WavesHub currently refreshes badge counts via two mechanisms:
1. `useFocusEffect` — refreshes on screen focus (navigating back from WaveDetail)
2. `subscribeToAutoGroupDone` — calls `fetchCounts()` after auto-group loop completes

When a photo is uploaded directly to a wave from WaveDetail (with `waveUuid`), the `autoGroupDone` event does not fire — `addPhotoToWave` is called directly by the upload service. The result is that WavesHub counts stay stale until the user navigates back.

## Goals / Non-Goals

**Goals:**
- Subscribe WavesHub to the upload bus and call `fetchCounts()` when `waveUuid` is present
- Follow the same pattern as the existing `subscribeToAutoGroupDone` subscription

**Non-Goals:**
- No optimistic UI updates on WaveCard photo counts
- No changes to the upload bus itself (it already emits `waveUuid`)
- No full wave list re-fetch on upload (only badge counts)

## Decisions

### Decision 1: Subscribe to uploadBus in WavesHub

**Choice:** Add `subscribeToUploadComplete` effect in WavesHub that calls `fetchCounts()` when `waveUuid != null`.

**Rationale:** This is the same pattern already used for `autoGroupDone`. Minimal code addition, leverages existing infrastructure.

**Alternatives considered:**
- Full wave list re-fetch: Overkill — only badge counts change
- Optimistic WaveCard count updates: Requires optimistic UI, rollback on failure
- New event bus: Unnecessary — uploadBus already has all the data

### Decision 2: Only refresh on `waveUuid != null`

**Choice:** `fetchCounts()` is only called when `uploadWaveUuid != null` (wave-specific upload).

**Rationale:** Main feed uploads (waveUuid undefined) already trigger auto-group which fires `autoGroupDone`. Filtering avoids redundant fetches.

## Risks / Trade-offs

[Risk: Extra API call on every wave-specific upload] → `fetchCounts()` is lightweight (2 queries: ungrouped count + waves count). Acceptable trade-off for consistent UX.

[Risk: Stale counts during upload burst] → Each upload triggers a `fetchCounts()`. If uploading 3 photos rapidly, 3 API calls fire. Mitigated by the fact `fetchCounts()` is fast (~100ms).
