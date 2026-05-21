## Context

Photos uploaded from non-wave screens (main feed, bookmarks) are never assigned to a wave at upload time. They accumulate as "ungrouped" until the drift-based auto-trigger fires when the user physically moves to a new location. The backend now provides `isLocationInWave(lat, lon, waveUuid, uuid): Boolean!` using PostGIS `ST_DWithin` to check if coordinates fall within a wave's geo-boundary. The backend also tracks one "active" wave per user via `isActive: true` on the Waves table, and `autoGroupPhotosIntoWaves` returns `isNewWave: true` when a new wave is created. The frontend has no awareness of `isActive` or `isLocationInWave` today.

Current upload flow: `useCameraCapture` → `enqueueCapture({ waveUuid })` → `processCompleteUpload` → `addPhotoToWave` (only if `waveUuid` is set). The `waveUuid` is either explicit (wave detail screen) or `undefined` (main feed). There is no geo-boundary check — wave detail uploads always tag to the viewed wave regardless of user location.

Key files: `src/screens/PhotosList/hooks/useCameraCapture.js`, `src/screens/PhotosList/upload/usePhotoUploader.js`, `src/screens/PhotosList/upload/photoUploadService.js`, `src/screens/WaveDetail/index.js`, `src/contexts/UploadContext.js`, `src/screens/WavesHub/index.js`, `src/utils/groupingAtom.js`, `src/utils/groupingStorage.js`, `src/events/autoGroupBus.js`, `src/screens/Waves/reducer.js`.

## Goals / Non-Goals

**Goals:**
- Automatically route photos to the correct wave at upload time when auto-grouping is enabled
- Detect location drift before upload and trigger auto-group to flush old ungrouped photos before starting a new wave
- Track the user's active wave on the frontend, persisted across restarts
- Enforce wave geo-boundaries for wave detail screen uploads (reject out-of-bounds photos into the generic ungrouped flow)
- Show toast notification when drift creates a new wave
- Fix the `grouping.enabled` flag being ignored by the existing drift trigger

**Non-Goals:**
- Changing the backend `autoGroupPhotosIntoWaves` mutation or `isLocationInWave` query (already implemented)
- Modifying how waves are created, named, or their radius/anchor logic
- Adding new GraphQL mutations or types
- Offline auto-grouping (requires network for `isLocationInWave` check)
- Removing the existing drift-based trigger (kept as fallback)

## Decisions

### 1. Active wave tracking: Jotai atom + AsyncStorage

**Decision**: Create an `activeWaveAtom` in `src/state.js` holding `{ waveUuid, name } | null`. Persist to AsyncStorage via a new `activeWaveStorage.js` utility. Hydrate on app startup.

**Why**: Follows the existing pattern used by `groupingAtom` (atom + storage + hydration). The active wave UUID is needed at capture time to call `isLocationInWave` without an extra API round-trip.

**Updates to the atom occur when**:
- App startup: load from AsyncStorage; if no cached value, fetch from `listWaves` (find `isActive: true`) on first Waves screen visit
- `autoGroupPhotosIntoWaves` returns `isNewWave: true`: update atom with returned `waveUuid` and `name`
- Active wave is deleted by user: clear atom

**Alternative considered**: Query a dedicated `getActiveWave` endpoint on startup. Rejected because `listWaves` already returns all needed fields and adding a new query increases backend scope unnecessarily.

### 2. Pre-upload drift check in `useCameraCapture`

**Decision**: Add the drift-check logic directly in `useCameraCapture`, before calling `enqueueCapture`. This is the single point where all camera captures flow through (both main feed and wave detail).

**Flow when `grouping.enabled` is true**:

```
takePhoto() called with { cameraType, waveUuid }
  │
  ├─ waveUuid set (wave detail screen)?
  │    checkWaveUuid = waveUuid
  │
  └─ waveUuid not set (main feed / bookmarks)?
       checkWaveUuid = activeWaveAtom.waveUuid
  │
  ├─ checkWaveUuid is null (no active wave)?
  │    → enqueue ungrouped, then autoGroupPhotosIntoWaves immediately
  │
  └─ checkWaveUuid exists?
       → call isLocationInWave(lat, lon, checkWaveUuid, uuid)
       │
       ├─ true: enqueue with waveUuid = checkWaveUuid
       │
       └─ false (DRIFTED):
            1. autoGroupPhotosIntoWaves (flush old ungrouped → old wave)
            2. enqueue without waveUuid (new photo is ungrouped)
            3. autoGroupPhotosIntoWaves (creates new wave from new photo)
            4. Update activeWaveAtom with new wave info
            5. Show toast: "Moved to new location — wave '<name>' created"
```

**Why this location**: `useCameraCapture` is already the pre-enqueue decision point. It has access to `locationState.coords` and receives `waveUuid` from the caller. Adding the check here avoids duplicating logic across PhotosList and WaveDetail.

**Alternative considered**: Post-upload check in UploadProvider (subscribe to uploadBus). Rejected because the user wants to auto-group *before* uploading when drift is detected, not after.

### 3. `isLocationInWave` GraphQL query in the waves reducer

**Decision**: Add the `isLocationInWave` query to `src/screens/Waves/reducer.js` alongside other wave GraphQL operations. Export it for use by `useCameraCapture`.

**Why**: All wave-related GraphQL operations live in this reducer. Consistent with existing patterns.

### 4. Wave detail uploads check boundaries

**Decision**: When `grouping.enabled` is true and a photo is taken from the wave detail screen, check `isLocationInWave` against the viewed wave. If the photo is outside the wave's boundary, drop the `waveUuid` and follow the generic ungrouped upload path (same as main feed drift case).

**Why**: Prevents accidentally adding a Manhattan photo to a Brooklyn wave. The user is viewing a wave but may have physically moved. The wave detail screen already passes `waveUuid` to `useCameraCapture`, so the unified check handles both cases.

**When `grouping.enabled` is false**: Upload to the viewed wave unconditionally (preserves current behavior for users who don't use auto-grouping).

### 5. Active wave update flow

**Decision**: After each `autoGroupPhotosIntoWaves` call that returns `isNewWave: true`, update `activeWaveAtom` and persist to AsyncStorage. Also add `isActive` to the `listWaves` query selection set so the Waves screen can sync on refresh.

**Why**: Ensures the frontend's cached active wave stays in sync with the backend's `isActive` flag. The `isNewWave` field from the mutation response is the primary sync mechanism; `listWaves` is a secondary validation on screen focus.

### 6. Toast notification on new wave creation

**Decision**: Show a toast via `react-native-toast-message` when drift detection creates a new wave: "Moved to new location — wave '<name>' created". Show from within the drift-check flow in `useCameraCapture`.

**Why**: User needs to understand why their photo wasn't added to the wave they expected (wave detail case) or why upload took slightly longer (main feed case).

### 7. Fix `grouping.enabled` guard

**Decision**: Add `grouping.enabled` check in two places:
- `useLocationDrift`: return `shouldTrigger: false` when `grouping.enabled` is false
- WavesHub auto-trigger effect: add `grouping.enabled` guard (defense in depth)

**Why**: Currently `grouping.enabled` is set in GroupingSettings but never read by the trigger logic. This is a bug — auto-group fires even when the user has disabled it.

## Risks / Trade-offs

- **[Upload latency when auto-grouping enabled]** → The `isLocationInWave` query + potential `autoGroupPhotosIntoWaves` calls add latency between photo capture and upload start. Acceptable trade-off per user decision; users can disable auto-grouping for instant uploads.
- **[Network required for drift check]** → `isLocationInWave` requires network. Mitigation: if offline, skip the check and enqueue ungrouped (same as current behavior). Photos will be auto-grouped when the user comes back online and triggers auto-group manually or via drift.
- **[Race condition with rapid photos]** → If user takes multiple photos rapidly at a new location, the first triggers auto-group (slow), while subsequent photos arrive before it completes. Mitigation: use a processing lock (ref flag) in `useCameraCapture` — while auto-group is running, subsequent captures wait for it to complete before checking `isLocationInWave` against the newly created wave.
- **[Active wave desync]** → If the backend's active wave changes outside the app (e.g., another device), the cached `activeWaveAtom` could be stale. Mitigation: `isLocationInWave` validates against the actual wave's geo-boundary, so a stale UUID would return `false`, triggering auto-group which self-corrects by syncing the new active wave.
- **[Wave detail UX surprise]** → User takes a photo while viewing a wave but they've moved — photo doesn't appear in the wave. Mitigation: toast explains what happened. User can still manually add the photo to the wave via the wave selector modal.
