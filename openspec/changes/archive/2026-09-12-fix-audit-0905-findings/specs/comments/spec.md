## ADDED Requirements

### Requirement: Photo details include watcher count
The `getPhotoDetails` query SHALL return the `watchersCount` for the photo, and the expanded photo card SHALL display the watcher/bookmark count from that field. The displayed count SHALL reflect the server-side watcher count, not a hardcoded or defaulted zero. This requires the backend `getPhotoDetails` operation to expose `watchersCount` (backend change coordinated via a copy-paste prompt for the Wisaw.cdk workspace; no backend files are modified in this repo).

#### Scenario: Expanded photo shows true bookmark count
- **WHEN** a photo is expanded inline in a feed
- **THEN** the watcher/bookmark count displayed on the card SHALL equal the `watchersCount` returned by `getPhotoDetails`
- **THEN** the count SHALL NOT default to 0 when the server reports a non-zero watcher count

#### Scenario: Bookmark count updates after watching
- **WHEN** the user bookmarks (watches) a photo and photo details are re-fetched
- **THEN** the displayed watcher count SHALL reflect the updated server-side `watchersCount`

### Requirement: Comment posting does not unconditionally bookmark
Posting a comment SHALL NOT unconditionally call the `watchPhoto` mutation. A comment submission SHALL bookmark the photo only when the photo is not already watched, preserving the existing behavior where the `watchPhoto` mutation gates the post-submission refresh signal.

#### Scenario: Commenting on an already-watched photo
- **WHEN** the user submits a comment on a photo they have already watched/bookmarked
- **THEN** the `watchPhoto` mutation SHALL NOT be called again
- **THEN** the post-submission refresh signal SHALL still be emitted after photo details are re-fetched

#### Scenario: Commenting on an unwatched photo
- **WHEN** the user submits a comment on a photo they have not watched
- **THEN** the `watchPhoto` mutation SHALL be called to bookmark the photo
- **THEN** the refresh signal SHALL be emitted only after the mutation completes
