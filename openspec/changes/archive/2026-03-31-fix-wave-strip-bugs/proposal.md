## Why

WavePhotoStrip has two bugs introduced by the `waves-ungrouped-photo-strip` change: (1) horizontal scroll pagination stalls because the component starts at `pageNumber: 0` but never fetches page 0 through `fetchFn`—the server never sees the batch UUID for page 0, so subsequent page requests return unpredictable results, especially on waves with few photos; (2) long-pressing a photo thumbnail in the strip does nothing, whereas it should trigger the wave's context menu (same action as the kebab menu / info bar long press).

## What Changes

- Fix WavePhotoStrip pagination: start internal `pageNumber` at `-1` so the first `handleLoadMore` fetches page 0 with the component's batch UUID, establishing proper server-side pagination state. Deduplicate against `initialPhotos` by photo ID.
- Add long-press support to WavePhotoStrip: accept an `onPhotoLongPress` callback prop, wrap each thumbnail in a `Pressable` with `onLongPress`, and wire it from WaveCard to invoke the wave-level long press handler (context menu).

## Capabilities

### New Capabilities

(none)

### Modified Capabilities
- `wave-photo-strip`: Fix pagination to start from page 0 with proper batch; add `onPhotoLongPress` callback prop and per-thumbnail press handling.
- `wave-hub`: WaveCard passes wave long-press handler through to WavePhotoStrip thumbnails.

## Impact

- `src/components/WavePhotoStrip/index.js` — pagination logic change + new prop + Pressable wrapper
- `src/components/WaveCard/index.js` — pass `onPhotoLongPress` to WavePhotoStrip
