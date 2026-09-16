## MODIFIED Requirements

### Requirement: Banner reads UploadContext and network state directly

The `GlobalUploadBanner` SHALL consume `UploadContext` and `STATE.netAvailable` directly. It SHALL NOT receive upload state as props from a parent screen. The banner SHALL read `STATE.netAvailable` via `useAtomValue` from the Jotai state module, NOT by destructuring it from `UploadContext`.

#### Scenario: Banner consumes context
- **WHEN** the banner renders
- **THEN** it SHALL call `useContext(UploadContext)` to get `pendingPhotos`, `isUploading`, `clearPendingQueue`, `isPaused`, `activeUploadId`, `pauseUploads`, `resumeUploads`, and `removePendingItem`
- **THEN** it SHALL read `STATE.netAvailable` via `useAtomValue` from the Jotai state module

#### Scenario: Status label reflects network and upload state
- **WHEN** `pendingPhotos` is non-empty and `isPaused` is `true`
- **THEN** the status label SHALL display "paused"
- **WHEN** `pendingPhotos` is non-empty and `isPaused` is `false` and `netAvailable` is `true` and `isUploading` is `true`
- **THEN** the status label SHALL display "uploading"
- **WHEN** `pendingPhotos` is non-empty and `isPaused` is `false` and `netAvailable` is `true` and `isUploading` is `false`
- **THEN** the status label SHALL display "ready to upload"
- **WHEN** `pendingPhotos` is non-empty and `netAvailable` is `false`
- **THEN** the status label SHALL display "waiting to upload"

#### Scenario: Icon animation responds to network state
- **WHEN** `pendingPhotos` is non-empty and `isPaused` is `false` and `netAvailable` is `true`
- **THEN** the upload icon SHALL pulse via `Animated.loop` animation
- **WHEN** `pendingPhotos` is non-empty and `netAvailable` is `false`
- **THEN** the upload icon SHALL NOT pulse and SHALL use the disabled color theme

#### Scenario: Icon reflects paused state
- **WHEN** `pendingPhotos` is non-empty and `isPaused` is `true`
- **THEN** the upload icon SHALL be a pause icon (`pause_circle`) in `theme.INTERACTIVE_PRIMARY`
- **THEN** the icon SHALL NOT pulse

#### Scenario: Progress strip is dimmed while paused
- **WHEN** `pendingPhotos` is non-empty, `netAvailable` is `true`, and `isPaused` is `true`
- **THEN** the bottom `LinearProgress` strip SHALL be rendered dimmed (reduced opacity)

#### Scenario: Banner hides when no pending uploads
- **WHEN** `pendingPhotos` is empty
- **THEN** the banner SHALL return null and publish `bannerHeightAtom` as 0

### Requirement: Banner handles toast offset internally

The `GlobalUploadBanner` SHALL compute its own toast top offset for toast notifications triggered by banner or queue modal actions (e.g., clear queue, delete selected).

#### Scenario: Toast appears below banner
- **WHEN** the user confirms clearing the upload queue from the banner or the queue modal
- **THEN** the toast SHALL appear below the banner using `safeAreaInsets.top + bannerHeight + 10`

## ADDED Requirements

### Requirement: Banner shows a 3-dots management button

The `GlobalUploadBanner` SHALL render a vertical 3-dots icon button (`MaterialIcons` `more_vert`) on the right edge of the banner card, after the status text. Tapping the 3-dots SHALL pause the queue and open the `UploadQueueModal`.

#### Scenario: 3-dots button renders when banner is visible
- **WHEN** the banner is visible
- **THEN** a 3-dots button SHALL be rendered at the right edge of the card, using `theme.TEXT_PRIMARY` color and `hitSlop` of at least 10 on all sides

#### Scenario: Tapping the 3-dots pauses and opens the modal
- **WHEN** the user taps the 3-dots button
- **THEN** `pauseUploads()` SHALL be called
- **THEN** the `UploadQueueModal` SHALL open

### Requirement: Long press pauses and opens the queue modal

Long-pressing the banner card SHALL pause the queue and open the `UploadQueueModal`. The previous behavior (a "Clear Upload Queue" confirm alert) SHALL be removed.

#### Scenario: Long press pauses and opens the modal
- **WHEN** the user long-presses the banner card
- **THEN** `pauseUploads()` SHALL be called
- **THEN** the `UploadQueueModal` SHALL open

#### Scenario: Long press does not show the clear confirm alert
- **WHEN** the user long-presses the banner card
- **THEN** the "Clear Upload Queue" confirm alert SHALL NOT be shown
