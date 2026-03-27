## MODIFIED Requirements

### Requirement: Comment Posting
The system SHALL allow users to post anonymous comments on any photo via a modal input interface with a send button. After successful submission, the system SHALL emit a photo refresh signal via `photoRefreshBus` to notify all mounted Photo instances.

#### Scenario: User posts a comment
- **WHEN** the user opens the comment input modal, types a message, and taps send
- **THEN** the comment is submitted to the server, appears in the comment thread, and a `photoRefreshBus` event is emitted with the photo's ID

#### Scenario: User submits empty comment
- **WHEN** the user taps send without entering text
- **THEN** the comment is not submitted and the input remains active

## REMOVED Requirements

### Requirement: Global callback Map for comment refresh
**Reason**: Replaced by `photoRefreshBus` event bus which supports multiple subscribers per photoId
**Migration**: All code using `global.photoRefreshCallbacks` SHALL use `emitPhotoRefresh({ photoId })` instead

### Requirement: Polling interval for comment detection
**Reason**: Replaced by instant event-driven notification via `photoRefreshBus`
**Migration**: Remove `global.lastCommentSubmission` timestamp and `setInterval` checking logic from Photo component
