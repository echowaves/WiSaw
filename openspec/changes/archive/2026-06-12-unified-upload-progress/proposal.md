## Why

The upload progress indicator (`PendingPhotosBanner`) is already built and working in PhotosList (5 render paths) and WaveDetail, but WavesHub has zero upload progress UI. Users taking photos from the waves list have no visual feedback that uploads are in progress — the card just shows "3 ungrouped photos" with no indication of what's happening.

## What Changes

- Add `PendingPhotosBanner` component to WavesHub screen, using the exact same component as PhotosList and WaveDetail
- Add `UploadContext` consumption to WavesHub to access `pendingPhotos`, `isUploading`, `clearPendingQueue`
- Add `usePendingAnimation` hook to WavesHub for consistent entrance/pulse animations
- Standardize WaveDetail to use `usePendingAnimation` hook instead of inline `useRef` animation values (currently it has its own refs but passes them to the banner)
- WavesHub already subscribes to `uploadBus` for count updates; keep existing behavior

## Capabilities

### Modified Capabilities
- `upload-orchestration`: WavesHub becomes a new consumer of `PendingPhotosBanner` for upload progress UI
- `wave-hub`: WavesHub SHALL display upload progress using the same `PendingPhotosBanner` component as PhotosList and WaveDetail

### New Capabilities
- None

## Impact

**Files modified:**
- `src/screens/WavesHub/index.js` — Add `UploadContext` consumption, `usePendingAnimation` hook, render `PendingPhotosBanner`
- `src/screens/WaveDetail/index.js` — Replace inline animation refs with `usePendingAnimation` hook (cleanup for consistency)
- No new dependencies — `PendingPhotosBanner` component and `usePendingAnimation` hook already exist in PhotosList
