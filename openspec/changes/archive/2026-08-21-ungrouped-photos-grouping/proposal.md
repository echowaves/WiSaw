## Why

The Waves Hub screen (`src/screens/WavesHub/index.js`) currently renders a flat list of `WaveCard`s, so when photos leave the grouping pool — most notably after a wave is deleted, which pushes those photos back into the ungrouped pool — the user has no affordance to regroup them, even though server auto-grouping only runs on upload. This change restores a first section on the Waves Hub that shows ungrouped photos when the pool is non-empty and gives the user an explicit way to force grouping.

## What Changes

- Re-introduces a first section at the top of the Waves Hub list showing ungrouped photos (gated on `getUngroupedPhotosCount({ uuid }) > 0`).
- The section is the restored `UngroupedPhotosCard` (accent/dashed styling, horizontal `WavePhotoStrip` fed by `feedForUngrouped`), now with a selection mode and a grouping action bar.
- Adds a selection mode: the user can tap individual thumbnails or "Select All", then act on the selection.
- Adds three gating actions: "Auto-Group everything" (server clusters the whole pool), "Create a wave", and "Add to an existing wave" (manual path moving only the selected photos via `addPhotoToWave`).

### Modified Capabilities

- `wave-hub`: the Waves Hub renders the ungrouped-photos card as a list header, refreshes the ungrouped count (especially after wave delete), and drives the selection-grouping actions.
- `ungrouped-photos-card`: the card gains selection mode and the grouping action bar (auto-group + manual create/existing-wave).

## Impact

- **App code**: `src/screens/WavesHub/index.js` (count state, header render, delete-trigger refresh), `src/screens/WavesHub/reducer.js` (re-exports), `src/screens/Waves/reducer.js` (verify `autoGroupPhotosIntoWaves` mutation exists), `src/components/UngroupedPhotosCard/index.js` (selection mode), `src/components/WavePhotoStrip/index.js` (selection props), `src/events/autoGroupBus.js` (refresh wiring).
- **Backend**: none. `autoGroupPhotosIntoWaves(uuid, groupingLevel)` is client-callable and processes the entire ungrouped pool; no per-photo scoping, so manual grouping uses `addPhotoToWave` and auto-group uses the existing mutation unchanged.
- **Dependencies**: none new.
