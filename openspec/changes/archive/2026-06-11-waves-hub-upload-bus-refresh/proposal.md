## Why

When a photo is uploaded from WaveDetail with a `waveUuid`, the WavesHub screen's badge counts (wave count, ungrouped photo count) remain stale until the user navigates back to WavesHub and `useFocusEffect` triggers a refresh. Photos uploaded from the main feed *do* trigger badge updates via `autoGroupDone`, creating an inconsistent UX. WavesHub should refresh its counts when uploads complete from any screen.

## What Changes

- Subscribe WavesHub to the upload bus (`uploadBus`)
- Call `fetchCounts()` in the upload bus listener when `waveUuid` is present (wave-specific upload)
- Add corresponding spec requirements to `upload-orchestration` and `wave-hub` specs

## Capabilities

### Modified Capabilities
- `upload-orchestration`: WavesHub becomes a new consumer of the upload bus (in addition to PhotosList and WaveDetail)
- `wave-hub`: WavesHub SHALL call `fetchCounts()` when the upload bus emits an upload completion event with a `waveUuid`

### New Capabilities
- None

## Impact

**Files modified:**
- `src/screens/WavesHub/index.js` — Add `subscribeToUploadComplete` effect calling `fetchCounts()` when `waveUuid` is set
- `src/events/uploadBus.js` — No changes (already emits `waveUuid`)

**Specs modified:**
- `openspec/specs/upload-orchestration/spec.md` — Add WavesHub upload bus subscription requirement
- `openspec/specs/wave-hub/spec.md` — Add badge refresh on upload requirement

**No backend or API changes required.**
