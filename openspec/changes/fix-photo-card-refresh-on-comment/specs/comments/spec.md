# Comments Specification

## MODIFIED Requirements

### Requirement: Comment Posting
The system SHALL allow users to post anonymous comments on any photo via a modal input interface with a send button. After successful submission, the system SHALL await the `watchPhoto` mutation (which bookmarks the photo on the backend), then emit a photo refresh signal via `photoRefreshBus` to notify all mounted Photo instances. The `watchPhoto` mutation MUST complete before the refresh signal is emitted, ensuring the bookmarked state is persisted before any re-fetch occurs.

#### Scenario: User posts a comment
- **WHEN** the user opens the comment input modal, types a message, and taps send
- **THEN** the comment is submitted to the server, the `watchPhoto` mutation completes, the comment appears in the comment thread, and a `photoRefreshBus` event is emitted with the photo's ID

#### Scenario: User submits empty comment
- **WHEN** the user taps send without entering text
- **THEN** the comment is not submitted and the input remains active

### Requirement: Comment Input Modal
The system SHALL provide an interactive comment composer as a root-level modal route (`app/modal-input.tsx`) with `presentation: 'modal'`, accessible from any navigator stack in the app. The modal SHALL display a text field and a send button in a custom `AppHeader`. After comment submission, the system SHALL emit a photo refresh signal and await `getPhotoDetails` before calling `router.back()`, ensuring the expanded card displays updated state (including `isPhotoWatched` bookmark status) when the user returns. After dismissal without submission, `router.back()` SHALL return the user to the screen they came from. When the Photo component is rendered in embedded mode (`embedded === true`), the "Add Comment" action SHALL use the inline comment input instead of navigating to the modal route.

#### Scenario: User opens comment input from PhotosList
- **WHEN** the user taps "Add Comment" on a photo expanded in PhotosList
- **THEN** the inline comment input SHALL appear within the expanded card
- **THEN** the modal route SHALL NOT be opened

#### Scenario: User opens comment input from WaveDetail
- **WHEN** the user taps "Add Comment" on a photo expanded in WaveDetail
- **THEN** the inline comment input SHALL appear within the expanded card

#### Scenario: User opens comment input from shared photo
- **WHEN** the user taps "Add Comment" on a shared photo detail screen (non-embedded)
- **THEN** the modal input interface SHALL open as a modal overlay
- **THEN** after submitting, the photo refresh signal is emitted and the refresh completes before the modal dismisses
- **THEN** the user SHALL return to the shared photo screen with updated state visible

#### Scenario: User opens comment input from standalone photo view
- **WHEN** the user taps "Add Comment" on a Photo rendered with `embedded === false`
- **THEN** the modal input interface SHALL open as a modal overlay

### Requirement: Inline Comment Submission Refresh
When a user submits a comment via the inline comment input in the expanded photo card, the system SHALL await the `watchPhoto` mutation, re-fetch photo details via `getPhotoDetails`, update the local `photoDetails` state, and emit a photo refresh signal.

#### Scenario: Inline comment submission updates photo state
- **WHEN** the user types a comment in the inline input and submits
- **THEN** the `watchPhoto` mutation completes, photo details are re-fetched, the local state is updated with fresh data including `isPhotoWatched`
- **THEN** the photo refresh signal is emitted and the bookmark icon state updates correctly

#### Scenario: Inline comment submission uses correct emitPhotoRefresh argument
- **WHEN** `emitPhotoRefresh` is called after inline comment submission
- **THEN** the argument MUST be `{ photoId }` (object with photoId property), not a raw string, to ensure subscribers receive the correct `photoId` value
