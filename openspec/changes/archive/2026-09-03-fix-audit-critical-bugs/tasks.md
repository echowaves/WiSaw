## 1. Join screen and deep-link error path (import fixes)

- [x] 1.1 In `app/(drawer)/waves/join.tsx`, add `import Toast from 'react-native-toast-message'` so the join-success (line ~126) and already-member (line ~152) `Toast.show` calls resolve
- [x] 1.2 In `app/_layout.tsx`, extend the `../src/utils/showErrorToast` import to include the default `showErrorToast` export so the deep-link navigation catch block (line ~208) stops throwing
- [x] 1.3 In `src/utils/showErrorToast.js`, give the `stack` parameter a default (`stack = null`) in the destructured signature so call sites that omit `stack` (join.tsx, tandc-modal.tsx, and the new _layout.tsx call) pass type-checking
- [x] 1.4 Run `npx tsc --noEmit` and confirm the 5 import/signature-related errors are gone (join.tsx ×3, app/_layout.tsx TS2304, tandc-modal.tsx TS2345), the remainder is the 6 known pre-existing errors (app/_layout.tsx TS2503 + TS2339, AppHeader TS2741), and no new errors were introduced

## 2. Upload success file cleanup

- [x] 2.1 In `src/screens/PhotosList/upload/photoUploadService.js`, add an exported `deleteLocalArtifacts(item)` helper that deletes `item.localImgUrl`, `item.localThumbUrl`, `item.localVideoUrl` (skip if equal to `localImgUrl`), and `item.originalCameraUrl` — each via `new FSFile(uri).delete()` in its own try/catch (the new FS API delete is synchronous and throws on missing files; never use `.catch()`)
- [x] 2.2 In the upload-success branch of `processQueue` in `src/screens/PhotosList/upload/usePhotoUploader.js`, call `deleteLocalArtifacts(currentItem)` after `removeFromQueue(currentItem)` succeeds and before/after `emitUploadComplete` — a deletion failure must not affect the success flow (log only)
- [x] 2.3 Manually verify (dev client): take a photo, wait for upload to complete, confirm the `pendingUploads` folder no longer contains the compressed image/thumb and the queue entry is gone; repeat with a video capture

## 3. Upload queue persistence safety

- [x] 3.1 In `photoUploadService.js` `initPendingUploads`, remove the `await writeQueue([])` from the catch block — keep the error log and per-item missing-file warnings; the stored queue must survive a read failure
- [x] 3.2 Verify: simulate a storage read failure (e.g., temporarily mock/corrupt the `PENDING_UPLOADS` key in a test or dev session) and confirm the queue is preserved and the next read returns the original items

## 4. Wave-tagged capture propagation

- [x] 4.1 In `src/hooks/useCameraCapture.js` `takePhoto`, pass `waveUuid` from `captureArgs` into every `enqueueCapture` call; collapse the three near-identical grouping branches (grouping off / offline / online) into a single enqueue path keeping the existing error toast handling
- [x] 4.2 Verify: from the Wave Detail screen, capture a photo; confirm the queue entry (via `getQueue` in a dev session or logs) carries `waveUuid` and that after upload the photo appears in the wave (backend `addPhotoToWave` fired)
- [x] 4.3 Verify: capture from the main feed still uploads with `waveUuid: undefined` and lands in the ungrouped pool

## 5. Wave share invite regeneration

- [x] 5.1 In `src/components/WaveShareModal.js`, track committed invite params separately from the raw text state (`inviteExpiryHours`, `inviteMaxUses`); remove the raw text state from the auto-execute effect's deps so `createWaveInvite` fires only once when the modal opens (invite-only waves)
- [x] 5.2 Add a "Regenerate Invite" button, visible only when the invite-only modal is open and the field values differ from the committed params; on press, commit the current values to the ref and re-run `execute()`
- [x] 5.3 Verify: open the share modal for an invite-only wave — exactly one `createWaveInvite` call; typing in the expiration/max-uses fields produces zero calls; pressing Regenerate produces exactly one call and the QR code updates to the new `deepLink`
- [x] 5.4 Verify: open-wave sharing flow is unchanged (shows `joinUrl` QR, no invite call, no Regenerate button)

## 6. Regression gates

- [x] 6.1 Run `npx jest --watchman=false` — all existing tests must pass (baseline: 5 suites / 46 tests)
- [x] 6.2 Run `npx tsc --noEmit` — exactly the 6 known pre-existing errors remain (baseline: 8 errors / 4 files; 5 removed by section 1)
- [x] 6.3 Smoke-test the deep-link flows (photo link, friend link, wave-join link, wave-invite link) in the dev client to confirm navigation + toasts render without console ReferenceErrors
