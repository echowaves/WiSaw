## Context

Both `PhotosList` and `WaveDetail` independently instantiate `usePhotoUploader` hooks that operate on a single shared AsyncStorage queue (`CONST.PENDING_UPLOADS_KEY`). The Drawer navigator keeps visited screens mounted (no `unmountOnBlur`), so when a user visits both Home and Waves, two uploaders race on the same queue. This causes:

1. **Wrong photos in wave feed** — WaveDetail's `handleUploadSuccess` blindly prepends any uploaded photo, even ones queued from the main feed (no `waveUuid`).
2. **Duplicate processing** — Both uploaders can call `processCompleteUpload` on the same queue item, potentially creating duplicate photos on the server.
3. **Lost notifications** — Whichever uploader processes an item first removes it from the queue; the other screen never learns about it.

The codebase already uses a Set-based event bus pattern in `src/events/` (autoGroupBus, waveAddBus, photoSearchBus, friendAddBus) for cross-screen communication.

## Goals / Non-Goals

**Goals:**
- Single uploader instance that owns queue processing, eliminating race conditions
- Wave-filtered upload notifications so photos only appear in the correct screen's feed
- Screens share upload state (pendingPhotos, isUploading) without duplicating logic
- Follow established codebase conventions (Set-based event bus, React Context)

**Non-Goals:**
- Changing the AsyncStorage-based queue storage mechanism
- Modifying `photoUploadService.js` internals (file processing, upload, mutations)
- Adding offline-first capabilities or queue partitioning per wave
- Changing the `createFrozenPhoto` boundary pattern

## Decisions

### 1. Single UploadProvider at Drawer layout level

**Choice:** Create an `UploadProvider` React component that wraps the Drawer's children in `app/(drawer)/_layout.tsx`. It instantiates the single `usePhotoUploader` and exposes `{ enqueueCapture, pendingPhotos, isUploading, clearPendingQueue }` via `UploadContext`.

**Why over alternatives:**
- *Root layout (`app/_layout.tsx`)*: Too high — would need to thread `uuid` from Jotai which is set up at that level. The Drawer layout already has Jotai available.
- *Per-screen with locking*: Adds complexity (module-level mutex, async coordination) without fixing the fundamental "two consumers" problem.
- *Jotai atom for upload state*: Would work for sharing state but doesn't solve the "who processes" question. A provider with a single hook instance is cleanest.

**Provider needs:** `uuid` and `setUuid` from `STATE.uuid` atom, `netAvailable` from a NetInfo listener, `topOffset` from safe area insets.

### 2. Upload event bus for completion notifications

**Choice:** Create `src/events/uploadBus.js` following the identical pattern as `autoGroupBus.js`. The bus emits `{ photo, waveUuid }` on each successful upload. Screens subscribe with `useEffect` and filter by relevance.

**Why over alternatives:**
- *Context callback*: Would couple the provider to knowing about every consumer's state shape. The bus decouples producer from consumers.
- *Jotai atom as "last uploaded" signal*: Awkward for events (atoms are for state, not signals). Would need manual reset logic.
- *Passing waveUuid back through onPhotoUploaded callback*: Simpler but keeps the multi-instance problem — doesn't prevent two uploaders.

### 3. Remove `onPhotoUploaded` parameter from `usePhotoUploader`

**Choice:** The hook emits to the upload bus directly after successful upload, reading `currentItem.waveUuid` from the queue item (already available at line ~95 of usePhotoUploader.js).

**Why:** Eliminates the screen-level callback entirely. The hook becomes self-contained — it processes the queue and broadcasts results. No consumer needs to wire a callback.

### 4. Screen subscription pattern

**Choice:** Each screen subscribes to the upload bus in a `useEffect` and handles photo insertion into its own local `useState`:

- **PhotosList**: Accepts all uploads (prepend with `createFrozenPhoto`, deduplicate).
- **WaveDetail**: Accepts only uploads where `waveUuid` matches the current wave's UUID.

If a screen is unmounted when the upload completes, it misses the event — but its next mount triggers a fresh server fetch, so no data is lost.

## Risks / Trade-offs

- **[Provider mounts before screens]** → The uploader starts processing on Drawer mount, before either screen is visible. Uploads succeed but bus events fire with no subscribers. This is safe because screens fetch fresh data on mount. Net effect: uploads start slightly sooner, which is an improvement.

- **[Toast topOffset at provider level]** → The provider needs a `topOffset` for Toast messages shown during upload errors. Using safe area insets at the Drawer level gives a reasonable default. The exact pixel value may differ slightly from screen-specific calculations, but Toast positioning is not pixel-critical.

- **[Breaking the `usePhotoUploader` API]** → Removing `onPhotoUploaded` is a breaking change for the hook's interface. However, only two call sites exist (PhotosList and WaveDetail), and both are being migrated in this change. No external consumers.

- **[NetInfo listener duplication]** → Both screens currently track `netAvailable` in their own state. The provider adds a third listener. NetInfo listeners are lightweight (under the hood it's a single native subscription). Could consolidate later but not worth the scope expansion now.
