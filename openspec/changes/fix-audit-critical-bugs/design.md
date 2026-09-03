## Context

See proposal.md for the full motivation. Relevant current state:

- `app/(drawer)/waves/join.tsx` calls `Toast.show` in two success paths without importing `Toast` (tsc TS2304). `app/_layout.tsx` calls `showErrorToast` in its deep-link catch without importing it.
- `photoUploadService.js` queue items carry `originalCameraUrl`, `localImgUrl` (compressed image moved into `PENDING_UPLOADS_FOLDER`, or video), and `localThumbUrl` (generated WEBP). `removeFromQueue` only edits the JSON queue in expo-storage; files survive forever after a successful upload. Only the manual "clear all" path (`clearQueue`) deletes files.
- `initPendingUploads` catches read errors and calls `writeQueue([])`, destroying the queue on any transient storage glitch.
- `useCameraCapture.takePhoto` receives `waveUuid` but all three enqueue branches (grouping off / offline / online) call `enqueueCapture` without it. The service, `PhotosListFooter`, and the upload bus already carry `waveUuid` end-to-end.
- `WaveShareModal` builds `inviteParamsRef` inside an effect whose deps include the raw `inviteExpiryHours`/`inviteMaxUses` text state, so every keystroke re-runs `execute()` → `createWaveInvite`.
- The new FS API in use here: `new FSFile(uri).delete()` is synchronous, returns `void`, and **throws** if the file is missing — it must be wrapped in try/catch, never `.catch()`.

## Goals / Non-Goals

**Goals:**
- Un-throw the two join/deep-link success/error paths (import-only fixes).
- Stop leaking local media after successful uploads; stop the startup queue wipe.
- Restore wave-tagged capture so wave-scoped cameras produce wave-tagged uploads.
- Make invite generation fire once on open and only on explicit re-generation.

**Non-Goals:**
- No changes to the upload retry/backoff state machine (the dead-backoff and silent health-check drop are separate findings, tracked for a future change).
- No Apollo cache/provider changes, no dead-code sweep, no dependency cleanup.
- No backend changes — all required operations already exist.

## Decisions

### D1: Import fixes + one-line signature default for the ReferenceErrors
Add `import Toast from 'react-native-toast-message'` to `join.tsx` and `import showErrorToast from '../src/utils/showErrorToast'` (adjusting the existing partial import from that module) to `app/_layout.tsx`. Additionally, give `stack` a default (`stack = null`) in `showErrorToast`'s destructured parameter in `src/utils/showErrorToast.js`.
**Rationale:** Minimal diff, zero behavior change beyond the intended un-throw. The `stack` default is required, not optional polish: `showErrorToast`'s inferred type (JS with `allowJs`) currently makes `title`, `message`, and `stack` all required, so `join.tsx:172` and `tandc-modal.tsx:34` already fail tsc (TS2345), and the `_layout.tsx:208` call would fail the same way the moment its import lands. Making `stack` optional matches how every call site in the codebase already uses the function. Alternatives (rewriting those paths to use the `showToast` helpers) would change toast styling/offset behavior for no benefit; adding `stack: undefined` at each call site would touch 3+ files for the same effect.

### D2: File cleanup in the success path, best-effort, after queue removal
In `processCompleteUpload`, after S3 upload returns 200 (and after the optional `addPhotoToWave`), delete the item's local files: `localImgUrl`, `localThumbUrl`, `localVideoUrl` (when present and distinct from `localImgUrl`), and `originalCameraUrl` — each via `new FSFile(uri).delete()` in its own try/catch. Do this inside `removeFromQueue`'s caller (the upload success branch of `usePhotoUploader.processQueue`) or as a new exported `deleteLocalArtifacts(item)` helper called from the success branch.
**Rationale:** Deleting in the success branch (not inside `removeFromQueue`) keeps `removeFromQueue`'s contract "remove the queue entry" intact — the manual clear-all path already deletes files separately, and tests that mock the queue stay valid. Per-file try/catch matches the existing `clearQueue` pattern and the spec's best-effort requirement. `originalCameraUrl` is an ImagePicker temp file; deleting it reclaims the largest single blob.
**Alternatives considered:** (a) delete inside `removeFromQueue` — rejected: conflates entry removal with filesystem side effects, and the "file missing" throw on already-cleaned items would need special-casing; (b) a background janitor sweeping `PENDING_UPLOADS_FOLDER` — rejected: the folder is shared with in-flight items and a janitor would need liveness checks; overkill.

### D3: `initPendingUploads` must not wipe the queue
Replace the `writeQueue([])` in the catch block with a log-only handler. Keep the per-item missing-file warnings.
**Rationale:** A read error is transient by definition; the stored queue is the user's data. The existing behavior of logging missing originals (without dropping items) is preserved; items with missing originals are already handled at upload time (`processCompleteUpload` removes them individually with a toast).

### D4: Propagate `waveUuid` in all three capture branches
Pass `waveUuid` from `takePhoto`'s `captureArgs` into every `enqueueCapture` call. The three branches become identical in data (they already are in practice, differing only in comment labels) — collapse to a single enqueue call with the existing error handling.
**Rationale:** The spec (`photo-upload`) already requires the queue item to carry the screen-provided `waveUuid`; the hook was the only broken link. Collapsing the branches removes the triplication that let the param drop in three places.
**Alternative:** keep three branches — rejected, they exist only because an earlier design assigned waves per-grouping-state; the current design assigns at upload time via `addPhotoToWave`, so the branches are dead differentiation.

### D5: Invite regeneration via explicit "Regenerate" affordance
`WaveShareModal` creates the invite once when the modal opens for an invite-only wave (using current option values, defaults 24h/unlimited). A new "Regenerate Invite" button (visible only when options are dirty, i.e. differ from the committed values) commits the current field values and re-runs `execute()`. The auto-fire effect's deps drop the raw text state; only `visible`, `wave`, `isOpen`, and a committed-params version trigger it.
**Rationale:** The modal currently has no explicit regenerate control; adding one is the only commit mechanism that is unambiguous on a touchscreen (blur-based commits are invisible to users, debounce still fires mid-typing). The dirty-state gating keeps the button out of the way in the common case (open → scan/share without touching options).
**Alternatives considered:** (a) commit-on-blur — rejected as invisible/undiscoverable; (b) 1s debounce on the text fields — rejected: the spec forbids firing on intermediate input, and debounce still creates invites the user abandoned; (c) require "Apply" on every open — rejected, adds friction to the primary flow (share immediately).

## Risks / Trade-offs

- [Deleting `originalCameraUrl` after upload removes the user's only copy of the captured file if they later want to re-upload it manually] → the capture flow already saves to the device photo library (`Asset.create`) before upload, so the user retains a copy; the pending queue is not user-visible as a "drafts" store.
- [FS `delete()` throws on missing files; a double-delete (manual clear-all racing the success path) throws] → each delete is individually try/caught and the throw is the expected no-op case; logged at debug level only.
- ["Regenerate" button changes the share modal's visible layout for invite-only waves] → gated on dirty state; open-wave modal is untouched; existing QR/share scenarios are unchanged.
- [Wave-tagged capture changes upload behavior for wave-screen users] → intended; the `addPhotoToWave` mutation is the same one the WaveSelectorModal path uses, and wave-add failures already toast without failing the upload.
- [tsc baseline currently has 8 pre-existing errors / 4 files] → this change removes 5 (join.tsx Toast ×2 + TS2345, _layout.tsx TS2304 + its would-be TS2345, tandc-modal.tsx TS2345) leaving 6 known pre-existing ones (app/_layout.tsx TS2503 JSX namespace + TS2339 appConfig, AppHeader TS2741 trackStyle); the change must not add any new ones.

## Migration Plan

1. Ship as a normal dev-client update; no data migration needed.
2. Queues containing items that were previously leaked-on-success are unaffected (those items are already gone from the queue; orphaned files are simply not reclaimed by this change).
3. Rollback: revert the commit; no schema/storage-format changes are introduced.

## Open Questions

(none — all decisions are resolvable from the existing codebase state)
