# Photo Refresh Sync Specification

## MODIFIED Requirements

### Requirement: Cross-Screen Refresh on Comment Addition
The system SHALL emit a photo refresh signal when a comment is successfully submitted, causing all mounted Photo instances for that photo to re-fetch their data. The refresh MUST reflect all photo state changes, including updated `watchersCount` and `isPhotoWatched` values returned by `getPhotoDetails`. The Photo component SHALL use `watchersCount` from the `getPhotoDetails` query response, not from the original photo object, ensuring the bookmark count stays current after any state-changing action.

#### Scenario: Comment added from WaveDetail screen
- **WHEN** a user adds a comment on a photo via the comment input modal opened from WaveDetail
- **THEN** the same photo expanded in PhotosList SHALL re-fetch and display the updated comment list including the new comment

#### Scenario: Comment added updates bookmark count
- **WHEN** a user adds a comment on a photo, causing the backend to auto-bookmark it
- **THEN** the expanded card SHALL re-fetch via `getPhotoDetails` and display the updated `watchersCount` from the query response
- **THEN** the `watchersCount` SHALL NOT be overwritten by the stale value from the original photo object

### Requirement: Photo Card State Accuracy
The system SHALL ensure that the expanded photo card always displays current state from the backend. When `getPhotoDetails` is called (during initial load or refresh), the returned `watchersCount` SHALL be used directly in the `photoDetails` state without override from external sources.

#### Scenario: Photo details load with correct watchersCount
- **WHEN** the Photo component loads or refreshes photo details via `getPhotoDetails`
- **THEN** the `watchersCount` in `photoDetails` state SHALL equal the value returned by the `getPhotoDetails` query
- **THEN** the `watchersCount` SHALL NOT be overwritten by `photo.watchersCount` from the original photo object
