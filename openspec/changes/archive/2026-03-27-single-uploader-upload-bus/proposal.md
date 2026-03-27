## Why

Both PhotosList and WaveDetail independently instantiate `usePhotoUploader` against the same shared AsyncStorage queue (`CONST.PENDING_UPLOADS_KEY`). Since the Drawer navigator keeps previously-visited screens mounted, both uploaders can race on the queue simultaneously — causing duplicate uploads, lost notifications, and photos appearing in the wrong wave feed.

## What Changes

- Create a single `UploadProvider` component that owns the one `usePhotoUploader` instance, placed at the Drawer layout level so it wraps both `(tabs)` and `waves` sections.
- Create an `uploadBus` event emitter (following the existing `autoGroupBus`/`waveAddBus` pattern) that broadcasts `{ photo, waveUuid }` on each successful upload.
- Modify `usePhotoUploader` to emit upload completions to the bus (with `waveUuid` from the queue item) instead of calling a screen-level `onPhotoUploaded` callback.
- PhotosList subscribes to the bus and prepends all uploaded photos to its local state.
- WaveDetail subscribes to the bus and only prepends photos whose `waveUuid` matches the current wave.
- Both screens consume `enqueueCapture`, `pendingPhotos`, `isUploading`, and `clearPendingQueue` from `UploadContext` instead of instantiating their own uploader.

## Capabilities

### New Capabilities
- `upload-orchestration`: Centralized upload provider, upload event bus, and screen-level upload subscription for wave-filtered photo insertion.

### Modified Capabilities
- `photo-upload`: Upload completions now broadcast via event bus with waveUuid metadata instead of per-screen callbacks. Pending uploads banner data comes from shared context.
- `photo-feed`: PhotosList no longer instantiates its own uploader; consumes upload context and subscribes to upload bus.
- `wave-detail`: WaveDetail no longer instantiates its own uploader; consumes upload context and subscribes to upload bus with wave-filtering.

## Impact

- `src/screens/PhotosList/upload/usePhotoUploader.js` — remove `onPhotoUploaded` callback parameter; emit to uploadBus with `waveUuid` from queue item instead.
- `src/screens/PhotosList/index.js` — remove `usePhotoUploader` instantiation and `handleUploadSuccess`; consume `UploadContext`; subscribe to upload bus.
- `src/screens/WaveDetail/index.js` — remove `usePhotoUploader` instantiation and `handleUploadSuccess`; consume `UploadContext`; subscribe to upload bus with waveUuid filter.
- `src/events/uploadBus.js` — new file (~20 lines), same pattern as existing event buses.
- `src/contexts/UploadContext.js` — new file, React context + provider wrapping `usePhotoUploader`.
- `app/(drawer)/_layout.tsx` — wrap drawer children with `<UploadProvider>`.
