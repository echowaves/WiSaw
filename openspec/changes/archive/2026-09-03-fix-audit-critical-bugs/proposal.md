## Why

The 2026-09-02 deep code audit found six defects that break user-visible flows or lose data: the wave join success path throws a `ReferenceError` (`Toast` not imported), the root deep-link error path throws (`showErrorToast` not imported), successful uploads leak local files forever, photos captured from wave screens upload as ungrouped (wave `waveUuid` dropped in the capture hook), the wave share modal fires the `createWaveInvite` mutation on every keystroke of the invite-options inputs, and any storage read error at startup silently wipes the entire pending upload queue.

## What Changes

- **`app/(drawer)/waves/join.tsx`**: import `Toast` from `react-native-toast-message` so the join-success and already-member feedback paths stop throwing after a successful join mutation.
- **`app/_layout.tsx`**: import `showErrorToast` from `src/utils/showErrorToast` so the deep-link navigation error path surfaces a toast instead of throwing inside its own catch.
- **`src/utils/showErrorToast.js`**: make the `stack` parameter optional (default `null`) — the inferred signature currently makes `stack` required, which is why existing call sites in `join.tsx` and `tandc-modal.tsx` already fail `tsc` (TS2345) and why the `_layout.tsx` call would once its import lands.
- **Upload success cleanup**: after a queued item uploads successfully and is removed from the queue, delete its local artifacts (compressed image, video, generated thumbnail, and the original camera temp file) from the pending-uploads folder / cache.
- **Upload queue persistence safety**: an error reading the pending upload queue at startup must no longer overwrite the stored queue with an empty one.
- **Wave-tagged capture**: `useCameraCapture` must pass the screen-provided `waveUuid` through to `enqueueCapture` in all grouping states (grouping off, offline, online) instead of dropping it.
- **Wave share invite generation**: `createWaveInvite` must fire only when the modal first opens or when the user explicitly changes a committed invite option — never on intermediate keystrokes.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `wave-deep-linking`: the join confirmation screen must show success/error feedback after the join mutation and must not throw on the success path (the "User confirms joining" scenarios gain an explicit user-feedback obligation).
- `photo-upload`: wave-tagged photo uploads must preserve the capture-time `waveUuid` through the camera capture hook in all grouping states.
- `photo-upload-orchestration`: local file cleanup after successful upload, and startup queue-read errors must preserve the stored queue.
- `wave-sharing`: invite generation for invite-only waves must not be re-triggered by intermediate input in the invite-option fields.

## Impact

- `app/(drawer)/waves/join.tsx` — import fix only; no behavior change beyond un-throwing the two success paths.
- `app/_layout.tsx` — import fix only; error toast now actually renders.
- `src/screens/PhotosList/upload/photoUploadService.js` — `removeFromQueue`/success path gains file deletion; `initPendingUploads` catch no longer writes `[]`.
- `src/hooks/useCameraCapture.js` — `waveUuid` propagated to `enqueueCapture`.
- `src/components/WaveShareModal.js` — invite-effect trigger reworked (commit-on-change or explicit action), same mutation, same params.
- No backend changes required — all five backend operations already exist (`joinOpenWave`, `joinWaveByInvite`, `createWave`, `addPhotoToWave`, `createWaveInvite`).
- Existing jest suite (46 tests) must stay green. `tsc --noEmit` baseline is 8 errors / 4 files; after this change the expected remainder is 6 (`app/_layout.tsx` JSX-namespace + `appConfig`-unknown, `AppHeader` trackStyle) — the 5 import/signature-related errors are eliminated and no new ones are introduced.
- `src/utils/showErrorToast.js` — `stack` parameter gains a default; existing call sites with `stack` are unaffected.
