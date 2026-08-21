## Why

Two separate issues surfaced in the iOS 27 dev-client console: (1) the raw-WebSocket AppSync subscription in `src/services/appsyncSubscription.js` is permanently broken — it reconnects every second forever (the `reconnectAttempts` reset in `onopen` defeats the backoff cap), the server replies `connection_error` to every `start` frame, and the subscription query itself does not match the backend schema (`_notifyPhotoUploadComplete(photoId: String!)` requires a per-photo argument, so a global "any upload" subscription is impossible). It is also redundant: same-device uploads already fire the same `uploadBus` `emitUploadComplete` event from `usePhotoUploader`. (2) `InteractionManager.runAfterInteractions` is deprecated in RN 0.86 and logs a warning on every use; RN ships `requestIdleCallback` as the replacement.

## What Changes

- **BREAKING** Remove `src/services/appsyncSubscription.js` (raw-WS AppSync subscription service).
- **BREAKING** Remove the `subscribeToPhotoUploadComplete()` wiring from `src/screens/WavesHub/index.js` (the `useEffect` that opens the WS on mount).
- Migrate `InteractionManager.runAfterInteractions` → `requestIdleCallback` and `task.cancel()` → `cancelIdleCallback(handle)` in:
  - `src/components/Photo/index.js` (photo details load)
  - `src/components/QuickActionsModal/index.js` (photo details load)
- Remove the now-unused `InteractionManager` imports from both components.
- No change to the local upload path: `usePhotoUploader.js` keeps calling `emitUploadComplete`, which remains the single source of feed-refresh events for WavesHub, WaveDetail, and useFeedLoader.
- Documented trade-off: cross-device live refresh (another device uploading into a wave) is no longer pushed to this client; it will appear on the next focus/refresh. Revisit with a per-photoId AppSync subscription (or another mechanism) if this becomes a requirement.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `wave-hub`: Removes the three AppSync WebSocket subscription requirements ("OnPhotoUploadComplete Subscription Works Without Errors", "Cross-Device Photo Upload Notification", "Subscription Lifecycle Management"). Upload-completion-driven refresh continues to be specified by the upload bus subscription requirements (unchanged).

## Impact

- Affected code:
  - `src/services/appsyncSubscription.js` — deleted
  - `src/screens/WavesHub/index.js` — WS effect removed (local `subscribeToUploadComplete` effect stays)
  - `src/components/Photo/index.js` — idle-callback migration
  - `src/components/QuickActionsModal/index.js` — idle-callback migration
- No dependency changes. `react-native-base64` and `uuid` remain used elsewhere.
- No backend changes required; no API/schema impact.
- Console output: eliminates the `[AppSync WS]` reconnect spam and the `InteractionManager has been deprecated` warning. Remaining iOS 27 simulator noise (status bar deprecation, Core Animation "cannot add handler to 0", keyboard-controller size-class logs, RCTScrollView focusItemsInRect, PointerUI port, CFNetwork error 60) is native/OS-originated and explicitly out of scope — not fixable from JavaScript.
