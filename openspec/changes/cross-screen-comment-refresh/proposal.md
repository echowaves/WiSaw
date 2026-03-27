## Why

When a comment is added or deleted on a photo expanded in WaveDetail, other mounted screens (PhotosList) showing the same photo don't update until the next full data fetch. The existing refresh mechanism uses `global.photoRefreshCallbacks` — a Map keyed by `photoId` that stores only one callback, so the last-registered Photo instance wins and other screens are never notified. A secondary polling mechanism (`global.lastCommentSubmission`) partially covers comment addition but with up to 1s latency and only as a fallback. Comment deletion has no cross-screen notification at all.

## What Changes

- Create a `photoRefreshBus` event bus following the Set-based listener pattern, enabling all mounted Photo instances with a matching `photoId` to receive refresh signals
- Photo component subscribes to the bus and triggers `setInternalRefreshKey` when its `photoId` matches
- Comment deletion handler (in Photo component) emits `emitPhotoRefresh({ photoId })` after successful deletion
- ModalInputText replaces `global.photoRefreshCallbacks.get(photoId)()` with `emitPhotoRefresh({ photoId })`
- Remove `global.photoRefreshCallbacks` Map registration/usage from Photo component and ModalInputText
- Remove the 1-second polling interval (`global.lastCommentSubmission` / `setInterval`) from Photo component

## Capabilities

### New Capabilities

- `photo-refresh-sync`: Cross-screen photo details refresh propagation via event bus

### Modified Capabilities

- `comments`: Comment addition and deletion now trigger a bus-based refresh instead of global callback Map and polling

## Impact

- New file: `src/events/photoRefreshBus.js`
- Modified: `src/components/Photo/index.js` — subscribe to bus, emit on comment delete, remove `global.photoRefreshCallbacks` registration and polling interval
- Modified: `src/screens/ModalInputText/index.js` — emit to bus instead of `global.photoRefreshCallbacks`, remove `global.lastCommentSubmission` fallback
