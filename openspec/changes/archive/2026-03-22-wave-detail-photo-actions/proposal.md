## Why

When a user removes a photo from a wave or moves it to another wave via the long-press QuickActionsModal in WaveDetail, the photo remains visible in the wave's photo list and the modal stays open. The delete action correctly closes the modal and removes the photo from the list, but wave actions lack equivalent callbacks.

## What Changes

- Add an `onRemovedFromWave` callback to `usePhotoActions` hook, called optimistically (before mutation) in both `handleWaveRemove` and `handleWaveSelect`
- Wire `QuickActionsModal` with a new `onPhotoRemovedFromWave` prop that closes the modal and notifies the parent
- WaveDetail's `QuickActionsModalWrapper` wires `onPhotoRemovedFromWave` to filter the photo from the list and close the modal (same pattern as `onPhotoDeleted`)
- PhotosList does not pass `onPhotoRemovedFromWave`, so wave actions in the main feed remain unaffected

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `quick-actions-modal`: Wave remove and wave move actions close the modal and notify the parent via callback (matching delete behavior)
- `wave-detail`: WaveDetail filters removed/moved photos from its list immediately via the new callback

## Impact

- `src/hooks/usePhotoActions.js` — new `onRemovedFromWave` parameter, called in `handleWaveRemove` and `handleWaveSelect`
- `src/components/QuickActionsModal/index.js` — new `onPhotoRemovedFromWave` prop, wired through to `usePhotoActions`
- `src/screens/WaveDetail/index.js` — `QuickActionsModalWrapper` passes `onPhotoRemovedFromWave` callback
- `src/screens/PhotosList/index.js` — no changes (does not pass the new prop)
