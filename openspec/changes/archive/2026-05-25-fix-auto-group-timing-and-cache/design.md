## Context

The upload pipeline processes queued photos sequentially in `usePhotoUploader.processQueue`. For each photo it calls `processCompleteUpload`, which currently calls `flushUngroupedPhotos` *before* creating the current photo on the server. This means the auto-group mutation never sees the photo being uploaded — it can only group previously uploaded photos. The last photo in a batch is never flushed at all.

Separately, the WavesHub screen calls `listWaves`, `getUngroupedPhotosCount`, and `getWavesCount` using Apollo's default `cache-first` policy, so returning to the screen after uploads/auto-grouping shows stale data.

## Goals / Non-Goals

**Goals:**
- Ensure every uploaded photo is included in auto-grouping, including the last one in a batch
- Auto-group fires exactly once per upload batch, after all photos are uploaded and the backend has had time to process
- WavesHub always shows fresh data from the server on every visit

**Non-Goals:**
- Changing the auto-group algorithm itself
- Adding real-time push notifications for auto-group completion
- Changing the manual auto-group trigger from the Waves screen

## Decisions

### 1. Remove per-photo flush, add post-drain flush with 5s delay
**Decision**: Remove the `flushUngroupedPhotos` call from `processCompleteUpload`. Instead, after the upload queue drains successfully in `usePhotoUploader.processQueue`, wait 5 seconds then call `flushUngroupedPhotos`.
**Rationale**: The per-photo flush is both wrong (runs before photo creation) and wasteful (N API calls per batch). A single post-drain flush with delay ensures the backend has processed the last upload's S3 file before auto-grouping queries for ungrouped photos.
**Alternative**: Flush synchronously right after the last upload (no delay) — rejected because the backend needs time to process the S3 upload before the photo appears as "ungrouped" in the database.

### 2. Only flush after successful full drain
**Decision**: The post-drain flush fires only when `remainingQueue.length === 0` (all uploads succeeded). If the queue breaks due to network loss or upload failure, no flush fires.
**Rationale**: Flushing after a partial upload would miss photos still in the local queue. Better to wait for all uploads to complete. The retry mechanism will eventually drain the queue and trigger the flush.

### 3. Use `network-only` for all WavesHub queries
**Decision**: Add `fetchPolicy: 'network-only'` to `listWaves`, `getUngroupedPhotosCount`, and `getWavesCount` in the Waves reducer.
**Rationale**: These queries power the Waves screen which the user navigates to after uploading photos. Stale cache defeats the purpose of the `useFocusEffect` refresh. The `batch` UUID parameter in `listWaves` may sometimes bust cache, but the count queries have identical variables (just `uuid`) so they always return cached data.
**Alternative**: Use `cache-and-network` to show cached data instantly then update — rejected because showing stale counts that then change is more confusing than a brief loading state.

## Risks / Trade-offs

- **[5s delay may not always be enough]** → If backend processing takes longer than 5 seconds, the last photo may still be missed. Mitigated by: the next manual refresh or screen focus will trigger another fetch. Could be adjusted later if needed.
- **[Photos ungrouped during delay]** → Between upload completion and the flush (5s window), photos are ungrouped on the server. No user-visible impact since the user is typically not on the Waves screen during this window.
- **[More network requests for Waves screen]** → `network-only` means every `useFocusEffect` hits the network. Acceptable trade-off for data freshness — the Waves screen already fires these calls on every focus, it just got cached results before.
