## Context

**Current State:**
- Photo uploads are queued via `enqueueCapture()` in `usePhotoUploader.js`
- Uploads only start when `netAvailable` (a Jotai atom) is truthy
- The `netAvailable` atom is initialized to `true` in `src/state.js` and never updated
- Network state is only checked during `processQueue()` via `NetInfo.fetch()` but this doesn't trigger new uploads

**Problem:**
- If network becomes unavailable and then available again, the atom stays stale
- Uploads that should start automatically never do because `if (netAvailable)` evaluates incorrectly
- Users see "n photos ready to upload" but nothing happens until they pull-to-refresh

**Stakeholders:**
- End users: Experience stuck uploads and need manual intervention
- Developers: Need to maintain and debug upload issues

## Goals / Non-Goals

**Goals:**
- Fix the photo upload stuck issue by ensuring `netAvailable` stays in sync with actual network connectivity
- Eliminate the need for manual pull-to-refresh to start uploads when network becomes available
- Maintain backward compatibility - no breaking changes

**Non-Goals:**
- Not changing the upload logic or queue processing
- Not adding new features or capabilities
- Not modifying the existing photo-upload spec (it correctly describes intended behavior)

## Decisions

**Decision: Use NetInfo.addEventListener to subscribe to network changes**

*Why:*
- `@react-native-community/netinfo` is already installed and used in `usePhotoUploader.js`
- The library provides a reactive `addEventListener` API that fires when network state changes
- This is the standard React Native approach for network state monitoring

*Alternatives considered:*
1. **Polling with setInterval**: Would add unnecessary CPU usage and latency
2. **Check network on every capture**: Would add latency to photo capture flow
3. **Use `NetInfo.fetch()` in useEffect**: Would require adding useEffect to every component using `netAvailable` - not scalable

**Decision: Create a hook `useNetInfoSubscription()` in src/state.js**

*Why:*
- Centralizes network subscription logic in one place
- Reusable across the app if needed elsewhere
- Follows existing pattern of exporting hooks from state.js (e.g., location hooks)
- Allows UploadContext to subscribe when mounted

**Decision: Call hook from UploadContext, not App entry point**

*Why:*
- UploadContext is the main consumer of `netAvailable` for upload functionality
- Keeps the subscription scoped to where it's actually needed
- UploadContext is always mounted during app usage (provides upload context to all screens)

## Risks / Trade-offs

**Risk:** Subscription starts when UploadContext mounts (not immediately on app start)

*Mitigation:* UploadContext is mounted very early in the app and stays mounted. The `netAvailable` atom is only used for upload-related decisions, so this timing is appropriate.

**Risk:** NetInfo may fire events before subscription is established

*Mitigation:* `NetInfo.fetch()` is called immediately in `processQueue()` to get current state. The subscription only updates the atom - it doesn't trigger uploads directly.

**Risk:** Multiple components calling the hook could create multiple subscriptions

*Mitigation:* React's `useEffect` cleanup ensures each component's subscription is cleaned up when unmounting. NetInfo's internal implementation handles deduplication.

## Migration Plan

**Deployment:**
1. No database migrations or backend changes needed
2. No API changes
3. No data migration required
4. Simple code change - deploy with normal release process

**Rollback Strategy:**
- If issues occur, revert the two files changed (`src/state.js`, `src/contexts/UploadContext.js`)
- The app will revert to the previous behavior (stuck uploads may still occur)

## Open Questions

None. The design is straightforward and well-understood based on the codebase analysis.
