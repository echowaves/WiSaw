# Fix save-to-library on camera capture

## Why

Captured photos no longer end up in the device photo library. `takePhoto` in `src/hooks/useCameraCapture.js` calls `MediaLibrary.saveToLibraryAsync(uri)`, but in `expo-media-library` ~57.0.4 that function is a **deprecated stub** that throws `Method saveToLibraryAsync imported from "expo-media-library" is deprecated` instead of saving. The surrounding `try/catch` swallows the error with a `console.error` ("Save to library error"), so the upload pipeline continues — the photo still uploads to WiSaw — but the user silently loses the local copy. Every capture since the SDK 57 upgrade hits this; it was confirmed in device logs during the `fix-upload-feed-dimensions` verification.

## What Changes

- `takePhoto` saves the captured file to the media library using the **new class-based API** (`Asset.create(filePath)` from `expo-media-library`) instead of the removed legacy function. The save remains best-effort: a failure is logged and never blocks the upload pipeline (temp URIs may be short-lived).
- The orphaned duplicate hook at `src/screens/PhotosList/hooks/useCameraCapture.js` is deleted. It is dead code — no file imports it (PhotosList and WaveDetail both import `src/hooks/useCameraCapture.js`) — and it carries the same broken call, which would re-break the fix if anyone ever imported it.
- No permission-flow changes: the hook already gates capture behind camera + media-library permissions (`ImagePicker.requestMediaLibraryPermissionsAsync` with write-only), which remain the correct permission request for the new API.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `photo-upload`: captured photos/videos SHALL be saved to the device media library via the current `expo-media-library` API, best-effort and non-blocking for the upload pipeline.

## Impact

- `src/hooks/useCameraCapture.js` — replace deprecated `saveToLibraryAsync` call with `Asset.create` (new API), keep best-effort error handling.
- `src/screens/PhotosList/hooks/useCameraCapture.js` — delete (dead duplicate).
- No backend changes, no dependency changes (`expo-media-library` ~57.0.4 already ships the new API).
- Affected screens: PhotosList, WaveDetail (both consume the shared hook).
