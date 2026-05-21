## Context

The current auto-grouping system makes wave assignment decisions at capture time in `useCameraCapture.js`. When a user takes a photo, the code:

1. Checks if grouping is enabled
2. If online and has an active wave, calls `isLocationInWave(lat, lon, waveUuid)` to check drift
3. If drifted, flushes old ungrouped photos via `autoGroupLoop`, enqueues the new photo as "ungrouped" (no waveUuid), then runs `autoGroupLoop` again to create a new wave

This creates two problems:
- **Complex capture logic**: ~100 lines of drift-check code in `takePhoto()` that must handle serialization, error recovery, and toast UX
- **Extra server round-trips**: When drift is detected, the photo goes ungrouped first, then requires a second `autoGroupPhotosIntoWaves` call to create the new wave

## Goals / Non-Goals

**Goals:**
- Move all drift detection logic from capture-time to upload-time
- Simplify `useCameraCapture.js` by removing ~100 lines of drift-check code
- Ensure every uploaded photo is assigned to a wave on first upload (no "ungrouped" state for uploaded photos)
- Maintain clean state before each upload by flushing pending ungrouped photos

**Non-Goals:**
- Changing the `isLocationInWave` GraphQL query or its semantics
- Adding new server endpoints
- Changing how auto-grouping works when triggered manually (e.g., from UngroupedPhotosCard)
- Modifying the capture flow for grouping-disabled case

## Decisions

### Decision 1: Move drift check into `processCompleteUpload()` in photoUploadService.js

**Rationale**: The upload service already has access to location data, network state, and all the GraphQL mutations needed. Moving the decision here means capture is purely "take a picture and queue it" — no wave logic at all.

```
capture: enqueue({ cameraImgUrl, type, location })  // no waveUuid when grouping enabled
upload:  processCompleteUpload() → checkAndAssignWave() → upload with waveUuid
```

### Decision 2: Use `loadActiveWave()` to get the current active wave at upload time

**Rationale**: The active wave may have changed since capture (e.g., user navigated between waves, or a new wave was created by auto-group). Loading it fresh at upload time ensures we use the most up-to-date value. This is stored in AsyncStorage via `activeWaveStorage.js`.

### Decision 3: Call `isLocationInWave(lat, lon, activeWaveUuid)` — same query as today

**Rationale**: No new endpoint needed. The existing query returns boolean (true = fits wave, false = drifted). When it returns false, we create a new wave and assign the photo to that instead.

### Decision 4: Create new wave with auto-generated name "Downtown - May 21, 2026"

**Rationale**: The user confirmed this format (location + date). Since `isLocationInWave` doesn't return location data, we use the photo's own coordinates to derive a human-readable location string. For now, use a simple coordinate-based name like "40.71°N 74.01°W - May 21, 2026" or similar.

### Decision 5: Flush pending ungrouped photos before processing each upload

**Rationale**: Ensures uploads start from a clean state where all previously queued photos are already assigned to waves. This is done by calling `autoGroupPhotosIntoWaves` (via the existing `runAutoGroupLoop` pattern) before processing the current photo.

### Decision 6: Drift check runs when network is available and photo is ready

**Rationale**: The upload pipeline in `usePhotoUploader.js` already checks `netAvailable` before processing. We add drift detection within that flow — if offline, skip drift check and enqueue without waveUuid (same as today's behavior).

### Decision 7: Remove concurrent capture serialization from useCameraCapture

**Rationale**: Since capture no longer does drift checking, the `driftCheckRef` serialization mechanism is no longer needed. The upload pipeline handles ordering naturally via its queue-based processing model.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Upload latency increases (now includes drift check) | Drift check is a single GraphQL call (~100ms). Acceptable trade-off for simpler capture code. |
| Active wave may change between capture and upload | This is actually better — we use the most current active wave at upload time, not a stale one from capture. |
| New wave naming without location data | Use photo coordinates to generate name (e.g., "40.71°N 74.01°W - May 21, 2026"). Can be improved later with reverse geocoding. |
| Flushing ungrouped photos before each upload adds latency | Only flushes when there are pending ungrouped items (checked first). Batch effect is minimal. |

## Migration Plan

No migration needed — this is a pure code refactor that changes internal behavior without affecting the API or user-facing features. The change can be deployed as-is.

## Open Questions

1. **New wave naming**: Should we use raw coordinates ("40.71°N 74.01°W") or try to derive a place name? Raw coordinates are simpler but less human-readable.
2. **Toast UX for new wave at upload time**: Today there's a "Moved to new location" toast when drift is detected during capture. Should we show a similar toast when a new wave is created during upload?
