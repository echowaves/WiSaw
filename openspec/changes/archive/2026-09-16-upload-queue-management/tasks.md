## 1. Upload hook: pause/resume + activeUploadId + per-item removal

- [x] 1.1 In `src/screens/PhotosList/upload/usePhotoUploader.js`, add `pausedRef` (useRef(false)) and `isPaused` state; add `pauseUploads()` that sets both, calls `cleanupRetry()`, and does not touch the in-flight transfer. Verify: unit test — `pauseUploads()` with no pass in flight sets `isPaused` true and clears any scheduled retry timer.
- [x] 1.2 Add `resumeUploads()` that clears `pausedRef` + `isPaused` and re-drives `processQueue()` when the queue is non-empty and `netAvailable` is true. Verify: unit test — resuming with a non-empty queue and network calls `processQueue`; resuming with an empty queue does not.
- [x] 1.3 Gate all automatic re-drive paths on `pausedRef.current`: the mount effect on `[netAvailable, uuid, processQueue]`, the 60s health-check interval, and the `AppState` "active" listener; also make `scheduleRetry` a no-op while paused and skip post-loop retry scheduling while paused. Verify: unit tests — with `isPaused` true, simulating netAvailable change, health-check tick, and AppState 'active' do not invoke `processQueue`.
- [x] 1.4 In the `processQueue` while-loop: `break` at the top of the iteration when `pausedRef.current` is set (stop-before-next-item). Verify: unit test — with the loop running and pause set, the loop does not start the next item after the current `processCompleteUpload` settles.
- [x] 1.5 Add `activeUploadId` state: set to `currentItem.photoId` immediately before `await processCompleteUpload(...)`, cleared to `null` in a `finally` around that call. Verify: unit test — `activeUploadId` is the in-flight item's photoId during the await and null after resolve and after reject.
- [x] 1.6 Add `removePendingItem(item)` composing `removeFromQueue(item)` + `deleteLocalArtifacts(item)` + `syncQueueFromStorage()`. Verify: unit test — calling it removes the item from the mock queue, calls `deleteLocalArtifacts` with the item, and re-syncs `pendingPhotos` state.
- [x] 1.7 Return `isPaused`, `activeUploadId`, `pauseUploads`, `resumeUploads`, `removePendingItem` from the hook. Verify: unit test — all five are present in the hook's return object.

## 2. UploadContext exposure

- [x] 2.1 In `src/contexts/UploadContext.js`, destructure and expose `isPaused`, `activeUploadId`, `pauseUploads`, `resumeUploads`, `removePendingItem` in the context value (update the default context object too). Verify: unit test rendering a consumer under `UploadProvider` — all five context values are defined and wired to the hook.

## 3. UploadQueueModal component

- [x] 3.1 Create `src/components/UploadQueueModal/index.js`: themed modal (pattern of `WaveSelectorModal`/`MergeWaveModal`) with a header (title "Upload queue" + close button) and a scrollable list of `pendingPhotos` rows, each row = thumbnail via `expo-cached-image` (`localThumbUrl` → `localImgUrl` → `originalCameraUrl` fallback chain) + label + selection indicator. Verify: render test — opening the modal with a mock queue renders one row per item.
- [x] 3.2 Row selection: tap toggles `photoId` in a local `selectedIds` Set; show a selection count; prune `selectedIds` in a `useEffect` when `pendingPhotos` changes so removed items can't stay selected. Verify: render test — tapping a row adds it, tapping again removes it; removing an item from the queue prunes its id from the selection count.
- [x] 3.3 In-flight row: when a row's `photoId` equals `activeUploadId`, render it dimmed with an `ActivityIndicator` instead of the selection indicator and ignore taps. Verify: render test — the active row is not toggleable and shows the spinner.
- [x] 3.4 Footer actions mirroring `UngroupedPhotosCard` gating: "Delete (N)" enabled iff `selectedIds.size > 0`; "Delete All" enabled iff `selectedIds.size === 0` (dimmed `opacity: 0.5` otherwise), both always rendered. Verify: render test — button enabled/disabled states flip as the selection set crosses zero.
- [x] 3.5 "Delete selected" handler: loop `removePendingItem` over the selection (sequential, guarded by a `deleting` flag), reset selection, keep modal open. Verify: render test — with 2 selected, both are removed via `removePendingItem`, selection resets, modal stays visible.
- [x] 3.6 "Delete all" handler: `showConfirmAlert` with the queue breakdown (photo/video counts), on confirm call `clearPendingQueue()`. Verify: render test — confirm triggers `clearPendingQueue`; cancel leaves the queue unchanged.
- [x] 3.7 Close behavior: close button and overlay tap both reset selection and call `resumeUploads()`; while `deleting` is true, ignore close/overlay taps. Verify: render test — closing calls `resumeUploads` and resets selection; a close tap mid-delete is ignored.
- [x] 3.8 Empty state: when the queue is empty while open, render "No pending uploads" and disable both delete actions. Verify: render test — empty queue renders the empty state with disabled buttons.

## 4. GlobalUploadBanner wiring

- [x] 4.1 Add a vertical 3-dots button (`MaterialIcons` `more_vert`, `theme.TEXT_PRIMARY`, `hitSlop` ≥ 10 all sides) at the right edge of the banner card, after the status text. Verify: render test — the button renders when the banner is visible.
- [x] 4.2 Add a single `handleManageQueue` (`pauseUploads()` + set local `queueModalVisible` true); wire both the 3-dots `onPress` and the card `onLongPress` to it. Render the `UploadQueueModal` from the banner, passing `pendingPhotos`, `activeUploadId`, and the context actions. Verify: render test — tapping the 3-dots and long-pressing the card each call `pauseUploads` and open the modal.
- [x] 4.3 Remove the old `handleClearQueue`/`showConfirmAlert` long-press path from the banner (the confirm now lives in the modal). Verify: render test — long-press does not invoke `showConfirmAlert`.
- [x] 4.4 Paused UI states: status label "paused" when `isPaused` (takes precedence over uploading/ready/waiting); icon switches to `pause_circle` in `theme.INTERACTIVE_PRIMARY` with no pulse; the bottom `LinearProgress` strip renders dimmed while paused. Verify: render test — with `isPaused` true the label reads "paused", the icon is `pause_circle`, and the progress strip has reduced opacity.
- [x] 4.5 Toast top offset: toasts from modal actions (clear queue, delete) use `safeAreaInsets.top + bannerHeight + 10`. Verify: render test — the success toast after a confirmed clear passes the banner-derived `topOffset`.

## 5. Integration verification

- [x] 5.1 Run the existing upload test suites (`src/screens/PhotosList/upload/__tests__/`) and the new unit tests; all green. Verify: `npx jest src/screens/PhotosList src/components/UploadQueueModal` passes with no regressions.
- [ ] 5.2 Manual flow check (per repo rules, user starts the app): (a) queue 2+ photos, long-press banner → banner shows "paused", modal opens, in-flight row (if any) dimmed with spinner; (b) select 1 photo → "Delete selected (1)" enabled, "Delete all from queue" dimmed; delete it → row gone; (c) close modal → uploads resume and continue from the next item; (d) with nothing selected, "Delete all from queue" confirms and clears the queue → banner disappears. Verify: all five steps behave as described on device/emulator.
- [x] 5.3 Lint the changed files (eslint, complexity ≤ 8). Verify: `npx eslint src/components/UploadQueueModal src/components/GlobalUploadBanner src/contexts/UploadContext.js src/screens/PhotosList/upload/usePhotoUploader.js` reports no errors.
