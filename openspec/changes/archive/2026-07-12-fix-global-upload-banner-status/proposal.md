## Why

The global photo upload progress bar shows only "waiting to upload" and never updates to reflect actual upload status ("uploading" or "ready to upload"). This is because `GlobalUploadBanner` destructures `netAvailable` from `UploadContext`, but `UploadContext` never exposes it — so `netAvailable` is always `undefined` (falsy), trapping the status label in its default branch. The spec already mandates reading `STATE.netAvailable` via `useAtomValue`, but the implementation diverged.

## What Changes

- Fix `GlobalUploadBanner` to read `STATE.netAvailable` from the Jotai atom directly (via `useAtomValue`) instead of destructuring it from `UploadContext`, matching the existing spec
- Remove `netAvailable` from the `UploadContext` destructuring in `GlobalUploadBanner` since it's not part of the context contract

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `global-upload-banner`: The banner's status label logic (`uploadStatusLabel`) currently defaults to "waiting to upload" because `netAvailable` is always falsy. The fix restores the three-state label: "waiting to upload" (no network), "ready to upload" (network available, not actively uploading), "uploading" (network + actively uploading). Additionally, the icon pulse animation and icon color gating on `netAvailable` will also resume working correctly.

## Impact

- `src/components/GlobalUploadBanner/index.js` — add `useAtomValue(STATE.netAvailable)`, remove `netAvailable` from context destructuring
- No impact on `UploadContext.js` — the context contract is correct as-is (`netAvailable` was never meant to be part of it)
