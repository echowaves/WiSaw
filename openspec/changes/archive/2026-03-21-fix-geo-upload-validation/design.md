## Context

Photos are a location-based social feature — every photo must have valid GPS coordinates to appear in the geo-feed. Currently, three failure paths allow photos to be uploaded without coordinates: (1) initial state is truthy `(0,0)` object, (2) WaveDetail passes `null` location, (3) no validation at capture or upload time.

## Goals / Non-Goals

**Goals:**
- Prevent any photo from being uploaded without valid geo coordinates
- Fix the initial location state so existing UI guards work correctly
- Add defense-in-depth validation at capture time and upload time
- Give WaveDetail proper location handling

**Non-Goals:**
- Changing the location permission flow or UX (already works correctly)
- Modifying backend/GraphQL schema validation
- Adding location refresh or background location updates
- Handling the edge case of actual (0,0) coordinates (Null Island — no users there)

## Decisions

### Use `null` as initial location state instead of `{ coords: { lat: 0, lon: 0 } }`

**Choice**: Change `useState({coords:{latitude:0,longitude:0}})` to `useState(null)` in `useLocationInit`.

**Rationale**: The existing `if (!location)` guard in PhotosList already blocks the camera and shows an "Enable Location" empty state. It just doesn't work because the initial `{coords:{...}}` object is truthy. Changing to `null` makes the guard effective with zero UI changes.

**Alternative considered**: Add a separate `isLocationReady` boolean state. Rejected — adds complexity when the simple null check already exists.

### Create a shared `isValidLocation` utility

**Choice**: `src/utils/isValidLocation.js` — validates `loc?.coords?.latitude` and `loc?.coords?.longitude` are both truthy numbers (not 0, not NaN, not undefined).

**Rationale**: Used in three places (useLocationInit guard, useCameraCapture guard, processCompleteUpload guard). Centralizing prevents inconsistent checks.

### Validate at capture time in `useCameraCapture`

**Choice**: Before calling `enqueueCapture`, check `isValidLocation(location)`. If invalid, show a toast and return without enqueuing.

**Rationale**: This is the earliest point where the user's intent meets the system. Catching invalid location here prevents any bad data from entering the upload queue.

### Validate at upload time in `processCompleteUpload` as last defense

**Choice**: Before calling `generatePhoto`, validate the queued item's location. If invalid, remove from queue and show error toast.

**Rationale**: Defense in depth. Catches items that somehow got into the queue with bad coordinates (e.g., WaveDetail's `null` location on previously queued items, or items queued during a past bug).

### Fix WaveDetail with `useLocationInit`

**Choice**: Add `useLocationInit` hook to WaveDetail, pass real location to `enqueueCapture`, and add a location guard for the camera.

**Rationale**: WaveDetail's camera feature is identical to PhotosList's — it should use the same location infrastructure. Reuses the existing hook without new abstractions.

## Risks / Trade-offs

- **[Low risk] WaveDetail UX change** → Users will now see a location prompt when first using the WaveDetail camera. This is correct behavior — they were previously uploading photos without coordinates.
- **[Low risk] Existing queued items with bad coordinates** → The upload-time validation will reject these and remove them from the queue. Users will see a toast. This is desired behavior — better to reject than upload to (0,0).
