# Photo Refresh Sync Specification

## MODIFIED Requirements

### Requirement: Cross-Screen Refresh on Comment Addition
The system SHALL emit a photo refresh signal when a comment is successfully submitted, causing all mounted Photo instances for that photo to re-fetch their data. The refresh MUST reflect photo state changes including updated `isPhotoWatched` value returned by `getPhotoDetails`. Note: The `watchersCount` field is not available in the `PhotoDetails` GraphQL type returned by `getPhotoDetails` (it only exists on the `Photo` type for list feeds), so bookmark count display will remain at the last known value from the original photo object.

#### Scenario: Comment added from WaveDetail screen
- **WHEN** a user adds a comment on a photo via the comment input modal opened from WaveDetail
- **THEN** the same photo expanded in PhotosList SHALL re-fetch and display the updated comment list including the new comment

#### Scenario: Comment added updates bookmark watch status
- **WHEN** a user adds a comment on a photo, causing the backend to auto-bookmark it
- **THEN** the expanded card SHALL re-fetch via `getPhotoDetails` and display the updated `isPhotoWatched` bookmark state
- **NOTE**: `watchersCount` is not returned by `getPhotoDetails` GraphQL query; it only exists on the `Photo` type (for list feeds), not `PhotoDetails`

### Requirement: Photo Card State Accuracy
The system SHALL ensure that the expanded photo card always displays current state from the backend. When `getPhotoDetails` is called (during initial load or refresh), the returned `isPhotoWatched` value SHALL be used directly in the `photoDetails` state.

#### Scenario: Photo details load with correct bookmark status
- **WHEN** the Photo component loads or refreshes photo details via `getPhotoDetails`
- **THEN** the `isPhotoWatched` in `photoDetails` state SHALL equal the value returned by the `getPhotoDetails` query
- **NOTE**: `watchersCount` is not available from `getPhotoDetails`; bookmark count display will not update after comment submission without backend schema changes
