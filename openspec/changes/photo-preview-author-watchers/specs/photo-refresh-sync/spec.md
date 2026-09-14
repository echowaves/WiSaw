# Delta: photo-refresh-sync

## MODIFIED Requirements

### Requirement: Cross-Screen Refresh on Comment Addition
The system SHALL emit a photo refresh signal when a comment is successfully submitted, causing all mounted Photo instances for that photo to re-fetch their data. The refresh MUST reflect photo state changes including updated `isPhotoWatched` value returned by `getPhotoDetails`. Once the backend returns `watchersCount` in `PhotoDetails`, the bookmark count display SHALL reflect that live value; until the backend provides the field, the display SHALL fall back to the photo's feed-snapshot `watchersCount`.

#### Scenario: Comment added from WaveDetail screen
- **WHEN** a user adds a comment on a photo via the comment input modal opened from WaveDetail
- **THEN** the same photo expanded in PhotosList SHALL re-fetch and display the updated comment list including the new comment

#### Scenario: Comment added updates bookmark watch status
- **WHEN** a user adds a comment on a photo, causing the backend to auto-bookmark it
- **THEN** the expanded card SHALL re-fetch via `getPhotoDetails` and display the updated `isPhotoWatched` bookmark state
- **AND** once the backend returns `watchersCount` in `getPhotoDetails`, the bookmark count display SHALL reflect that live value; until then it SHALL fall back to the feed-snapshot `watchersCount`

### Requirement: Photo Card State Accuracy
The system SHALL ensure that the expanded photo card always displays current state from the backend. When `getPhotoDetails` is called (during initial load or refresh), the returned `isPhotoWatched` value SHALL be used directly in the `photoDetails` state. The bookmark (watchers) count display SHALL use the `watchersCount` returned by `getPhotoDetails` when present, and SHALL otherwise fall back to the photo's feed-snapshot `watchersCount`.

#### Scenario: Photo details load with correct bookmark status
- **WHEN** the Photo component loads or refreshes photo details via `getPhotoDetails`
- **THEN** the `isPhotoWatched` in `photoDetails` state SHALL equal the value returned by the `getPhotoDetails` query
- **AND** the bookmark count display SHALL use the `getPhotoDetails` `watchersCount` when present, otherwise the feed-snapshot `watchersCount`
