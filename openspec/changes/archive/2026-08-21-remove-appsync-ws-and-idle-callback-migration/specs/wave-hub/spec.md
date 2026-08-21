# wave-hub — Delta

## REMOVED Requirements

### Requirement: OnPhotoUploadComplete Subscription Works Without Errors
**Reason**: The raw-WebSocket AppSync subscription is permanently broken and redundant. The backend schema only exposes `_notifyPhotoUploadComplete(photoId: String!, photosGrouped: Int!)` (argument-scoped, per-photo), so a global "any upload" subscription is impossible; the client query used a non-existent field name and was missing the required argument. The server replies `connection_error` to every `start` frame, and the reconnect backoff was defeated by resetting `reconnectAttempts` on every `onopen`, producing an infinite 1-second reconnect loop. Same-device uploads already emit the same `uploadBus` `emitUploadComplete` event from the local upload flow, which is what WavesHub actually reacts to.
**Migration**: Delete `src/services/appsyncSubscription.js` and remove the `subscribeToPhotoUploadComplete()` effect from `src/screens/WavesHub/index.js`. Upload-completion refresh is provided solely by the local `uploadBus` (`subscribeToUploadComplete`), which is unchanged. Cross-device upload visibility now depends on the existing focus/mount refresh; revisit with a per-`photoId` AppSync subscription if live cross-device refresh becomes a requirement.

### Requirement: Cross-Device Photo Upload Notification
**Reason**: There is no longer any AppSync WebSocket path; the backend subscription is argument-scoped to a specific `photoId`, so a generic cross-device push cannot be established. Local (same-device) upload completion notifications still flow through the unchanged `uploadBus`.
**Migration**: No action for same-device behavior (unchanged). Cross-device uploads will appear on the next waves-list refresh (mount/focus). If live cross-device notification is required, introduce a per-`photoId` subscription opened at upload time in a future change.

### Requirement: Subscription Lifecycle Management
**Reason**: The WebSocket subscription no longer exists, so its lifecycle (lazy creation, cleanup, reconnect) is moot.
**Migration**: No replacement lifecycle needed. The local `subscribeToUploadComplete` bus subscription (mount/unmount cleanup) is already specified under the upload-orchestration capability and remains in place.

## ADDED Requirements

### Requirement: WavesHub does not maintain an AppSync real-time connection
The WavesHub screen SHALL NOT open or manage an AppSync real-time WebSocket connection. Feed and badge refresh on upload completion SHALL be driven solely by the local `uploadBus` (`subscribeToUploadComplete`) and by the existing mount/focus refresh paths.

#### Scenario: No WebSocket connection on mount
- **WHEN** the WavesHub screen mounts with a valid `uuid`
- **THEN** no AppSync real-time WebSocket connection is opened
- **AND** no reconnect/backoff timers related to an AppSync subscription are scheduled

#### Scenario: Same-device upload still refreshes the waves list
- **WHEN** a photo upload completes on this device and `emitUploadComplete` fires on the `uploadBus`
- **THEN** WavesHub SHALL refresh the waves list and ungrouped photo count via its `uploadBus` subscription (behavior unchanged from prior bus-based requirements)

#### Scenario: Cross-device upload appears on next refresh
- **WHEN** another device uploads a photo to a wave visible to this user
- **THEN** no real-time event is delivered to this client
- **AND** the new photo SHALL appear on the next waves-list refresh (mount or focus)
