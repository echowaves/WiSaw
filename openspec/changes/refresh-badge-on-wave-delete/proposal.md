## Why

When a wave is deleted, its photos become ungrouped — but the ungrouped-photos count badge on the auto-group button doesn't update until the user navigates away and back. This makes the badge stale and misleading.

## What Changes

- After a successful wave deletion in WavesHub, emit `autoGroupDone` so the badge refreshes immediately.
- After a successful wave deletion in WaveDetail, emit `autoGroupDone` so the badge refreshes when `router.back()` returns to the Waves screen (covers any race with `useFocusEffect`).

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `wave-hub`: After `deleteWave` succeeds, emit `autoGroupDone` event to trigger ungrouped count refresh.
- `wave-detail`: After `deleteWave` succeeds, emit `autoGroupDone` event to trigger ungrouped count refresh.

## Impact

- `src/screens/WavesHub/index.js` — add `emitAutoGroupDone()` call in `handleDeleteWave`.
- `src/screens/WaveDetail/index.js` — add `emitAutoGroupDone()` call in `handleDeleteWave`.
- No new dependencies. Reuses existing `autoGroupBus` event system.
