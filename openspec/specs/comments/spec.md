# Comments Specification

## Purpose
The comments system enables anonymous real-time engagement on photos through a comment thread interface with live WebSocket updates. Users can view, post, and interact with comments on any photo in the feed or via deep-linked shared photos.
## Requirements
### Requirement: Comment Posting
The system SHALL allow users to post anonymous comments on any photo via a modal input interface with a send button. After successful submission, the system SHALL await the `watchPhoto` mutation (which bookmarks the photo on the backend), then emit a photo refresh signal via `photoRefreshBus` to notify all mounted Photo instances. The `watchPhoto` mutation MUST complete before the refresh signal is emitted, ensuring the bookmarked state is persisted before any re-fetch occurs.

#### Scenario: User posts a comment
- **WHEN** the user opens the comment input modal, types a message, and taps send
- **THEN** the comment is submitted to the server, the `watchPhoto` mutation completes, the comment appears in the comment thread, and a `photoRefreshBus` event is emitted with the photo's ID

#### Scenario: User submits empty comment
- **WHEN** the user taps send without entering text
- **THEN** the comment is not submitted and the input remains active

### Requirement: Real-Time Comment Updates
The system SHALL receive and display new comments in real-time via WebSocket subscriptions without requiring manual refresh.

#### Scenario: Another user posts a comment
- **WHEN** another user posts a comment on the same photo
- **THEN** the new comment appears in real-time in the comment thread

### Requirement: Comment Thread Display
The system SHALL display comments in chronological order with user display names and timestamps.

#### Scenario: User views photo comments
- **WHEN** the user opens a photo's comment thread
- **THEN** all existing comments are displayed in chronological order with names and timestamps

### Requirement: Shared Photo Comment Viewing
The system SHALL display comments on deep-linked shared photos with automatic refresh when the screen regains focus.

#### Scenario: User opens shared photo link
- **WHEN** the user opens a deep link to a shared photo
- **THEN** the photo's comments are displayed and refresh automatically when returning to the screen

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

### Requirement: Comment input keyboard avoidance library
The comment input modal SHALL use `KeyboardAwareScrollView` from `react-native-keyboard-controller` instead of `react-native-keyboard-aware-scroll-view`.

#### Scenario: Comment input remains visible when keyboard opens
- **WHEN** a user taps the comment input field
- **THEN** the modal content SHALL scroll so the input and send button remain visible above the keyboard

### Requirement: Comment submission dismisses keyboard
After a user submits a comment via either the inline comment input or modal input, the system SHALL immediately dismiss the keyboard.

#### Scenario: User submits inline comment via send button
- **WHEN** the user taps the send button in the inline comment input row
- **THEN** the keyboard SHALL dismiss immediately after the comment submission completes
- **THEN** the inline input SHALL collapse back to the "Add Comment" button

#### Scenario: User submits inline comment via keyboard return key
- **WHEN** the user presses the return/send key on the keyboard while typing a comment
- **THEN** the keyboard SHALL dismiss immediately after the comment submission completes
- **THEN** the inline input SHALL collapse back to the "Add Comment" button

#### Scenario: User submits modal comment via header send button
- **WHEN** the user taps the send button in the modal input header
- **THEN** the keyboard SHALL dismiss immediately after the comment submission completes
- **THEN** the modal SHALL navigate back to the previous screen

#### Scenario: User submits modal comment via submit button
- **WHEN** the user taps the submit button at the bottom of the modal input
- **THEN** the keyboard SHALL dismiss immediately after the comment submission completes
- **THEN** the modal SHALL navigate back to the previous screen

#### Scenario: Empty comment submission does not dismiss keyboard
- **WHEN** the user taps send without entering text
- **THEN** the comment is not submitted
- **THEN** the input remains active with keyboard visible

