## Why

When a photo is deleted in WaveDetail, PhotosList still shows it until the next server fetch because `removePhoto` from `PhotosListContext` only updates the current screen's local state. The Drawer navigator keeps both screens mounted, so deletion must propagate across screens — the same cross-screen sync problem solved for uploads with `uploadBus`.

## What Changes

- Create a `photoDeletionBus` event bus following the existing Set-based listener pattern in `src/events/`
- Emit a deletion event from `usePhotoActions.handleDelete` after successful `deletePhoto` mutation — this single emit point covers both expanded Photo and QuickActionsModal entry points
- PhotosList subscribes to the bus and removes matching photos from its local state
- WaveDetail subscribes to the bus and removes matching photos from its local state
- Existing `onDeleted`/`onPhotoDeleted` callbacks remain for immediate local UI response; the bus adds cross-screen sync

## Capabilities

### New Capabilities

- `photo-deletion-sync`: Cross-screen photo deletion propagation via event bus

### Modified Capabilities

- `photo-feed`: Subscribe to photo deletion bus to remove deleted photos from local state
- `wave-detail`: Subscribe to photo deletion bus to remove deleted photos from local state
- `quick-actions-modal`: No spec-level requirement change — deletion already delegated to `usePhotoActions`

## Impact

- New file: `src/events/photoDeletionBus.js`
- Modified: `src/hooks/usePhotoActions.js` — emit deletion event after successful mutation
- Modified: `src/screens/PhotosList/index.js` — subscribe to deletion bus
- Modified: `src/screens/WaveDetail/index.js` — subscribe to deletion bus
