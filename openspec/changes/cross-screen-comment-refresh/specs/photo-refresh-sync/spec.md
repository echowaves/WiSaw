# Photo Refresh Sync Specification

## Purpose
The photo refresh sync system enables instant cross-screen propagation of photo data changes via a Set-based event bus. When a comment is added or deleted on one screen, all other mounted Photo instances displaying the same photo refresh their data automatically.

## Requirements

### Requirement: Photo Refresh Event Bus
The system SHALL provide a `photoRefreshBus` event bus that allows multiple subscribers to listen for photo refresh signals identified by `photoId`.

#### Scenario: Multiple Photo instances subscribe for the same photoId
- **WHEN** two or more Photo components displaying the same photo are mounted across different screens
- **THEN** each component SHALL have an active subscription to the photo refresh bus

#### Scenario: Subscriber receives targeted refresh signal
- **WHEN** `emitPhotoRefresh({ photoId })` is called
- **THEN** all subscribers SHALL receive the event and each subscriber SHALL filter by its own `photoId` to determine whether to refresh

#### Scenario: Unsubscribe on unmount
- **WHEN** a Photo component unmounts
- **THEN** its subscription SHALL be removed from the bus and no further events SHALL be delivered to it

### Requirement: Cross-Screen Refresh on Comment Deletion
The system SHALL emit a photo refresh signal when a comment is successfully deleted, causing all other mounted Photo instances for that photo to re-fetch their data.

#### Scenario: Comment deleted on WaveDetail screen
- **WHEN** a user deletes a comment on a photo expanded in WaveDetail
- **THEN** the same photo expanded in PhotosList SHALL re-fetch and display the updated comment list without the deleted comment

### Requirement: Cross-Screen Refresh on Comment Addition
The system SHALL emit a photo refresh signal when a comment is successfully submitted, causing all mounted Photo instances for that photo to re-fetch their data.

#### Scenario: Comment added from WaveDetail screen
- **WHEN** a user adds a comment on a photo via the comment input modal opened from WaveDetail
- **THEN** the same photo expanded in PhotosList SHALL re-fetch and display the updated comment list including the new comment

### Requirement: No Polling for Comment Changes
The system SHALL NOT use polling intervals to detect comment changes. All comment change propagation SHALL be event-driven via the bus.

#### Scenario: Photo component has no polling interval
- **WHEN** a Photo component is mounted
- **THEN** it SHALL NOT create a `setInterval` for checking `global.lastCommentSubmission` or any other polling mechanism for comment changes
