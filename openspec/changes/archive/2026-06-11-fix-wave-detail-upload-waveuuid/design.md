## Context

Photos taken from the WaveDetail screen should be associated with that wave. The `waveUuid` is correctly passed from the WaveDetail route params through the footer's camera buttons to `checkPermissionsForPhotoTaking()`, but `takePhoto()` ignores it — the `captureArgs` object does not include `waveUuid`, so the queue item is created with `waveUuid: undefined`.

Current data flow (broken):

```
WaveDetail (waveUuid = "abc-123")
  → PhotosListFooter (receives waveUuid ✓)
    → checkPermissionsForPhotoTaking({ waveUuid }) ✓
      → takePhoto({ waveUuid }) ✓ receives it
        → captureArgs = { cameraImgUrl, type, location } ✗ waveUuid NOT included
          → enqueueCapture(captureArgs)
            → queueFileForUpload({ waveUuid: undefined }) ✗
```

Full pipeline (working once fixed):

```
WaveDetail (waveUuid = "abc-123")
  → PhotosListFooter (receives waveUuid ✓)
    → checkPermissionsForPhotoTaking({ waveUuid }) ✓
      → takePhoto({ waveUuid }) → captureArgs includes waveUuid ✓
        → enqueueCapture(captureArgs) ✓
          → queueFileForUpload({ waveUuid: "abc-123" }) ✓
            → queue item stores waveUuid ✓
              → processCompleteUpload reads item.waveUuid ✓
                → addPhotoToWave mutation called ✓
                  → emitUploadComplete({ photo, waveUuid: "abc-123" }) ✓
                    → WaveDetail upload bus subscriber filters by waveUuid ✓
```

## Goals / Non-Goals

**Goals:**
- Fix `takePhoto()` to include `waveUuid` in `captureArgs`
- Verify the full upload pipeline correctly associates the photo with the wave

**Non-Goals:**
- No backend API changes
- No spec changes (existing `photo-upload` spec already describes correct behavior)
- No changes to the main feed upload flow

## Decisions

### Decision 1: One-line fix in useCameraCapture.js only

**Choice:** Add `waveUuid` to `captureArgs` in `takePhoto()`.

**Rationale:** The rest of the pipeline (footer → enqueue → queue → upload → addPhotoToWave → emit → subscribe) is already correct. The bug is a single missing property. No refactoring needed.

**Alternatives considered:**
- Add waveUuid at a different point in the pipeline (e.g., in footer or enqueue) — would require more changes and be harder to reason about ownership
- Add a defensive check in processCompleteUpload to accept waveUuid as a separate parameter — over-engineering for a one-line bug

## Risks / Trade-offs

**Risk:** None meaningful. This is a single property addition with no behavioral changes to existing paths.

**Trade-off:** None. The fix restores intended behavior.
