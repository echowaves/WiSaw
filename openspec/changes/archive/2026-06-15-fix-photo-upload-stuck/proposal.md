## Why

The photo upload indicator sometimes gets stuck showing "n photos ready to upload" and never starts uploading until the user performs a manual action (pull-to-refresh or app restart).

The root cause is that the `netAvailable` Jotai atom (used throughout the codebase to check network availability) is initialized to `true` and **never updated** when network connectivity changes. The upload logic relies on this atom to decide when to trigger uploads, but it becomes stale when network state changes.

## What Changes

- Add a NetInfo subscription that keeps the `netAvailable` atom in sync with actual network connectivity
- The subscription will update the atom when `isConnected && isInternetReachable !== false`
- This ensures all components using `netAvailable` (including upload triggers) have accurate state

## Capabilities

### New Capabilities
- None (no new user-facing features)

### Modified Capabilities
- `photo-upload`: The implementation will be fixed to properly detect network availability and trigger uploads automatically. The spec defines expected behavior for photo uploads, and this change fixes a bug where uploads don't start when network becomes available.

## Impact

**Affected files:**
- `src/state.js`: Add `useNetInfoSubscription()` hook that subscribes to NetInfo changes and updates the `netAvailable` atom
- `src/contexts/UploadContext.js`: Call `useNetInfoSubscription()` to start the subscription when the upload context is mounted
- `src/screens/PhotosList/upload/usePhotoUploader.js`: Will now receive an up-to-date `netAvailable` value, allowing the `useEffect` hooks and `enqueueCapture()` to trigger uploads correctly
- `src/screens/PhotosList/components/PendingPhotosBanner.js`: UI will show correct status because `netAvailable` is now accurate

**No breaking changes.** This is a bug fix that makes existing behavior more reliable.
